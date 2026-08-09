import { defineHandler } from "nitro";
import type { H3EventContext } from "nitro/h3";
import { messages } from "#lib/twitch/messages.ts";
import { TWITCH_ENDPOINTS } from "#server/integrations/twitch/constants.ts";
import type { OAuthData } from "#server/integrations/twitch/types.ts";
import {
    createUserTwitchFetch,
    TwitchRateLimitError,
} from "#server/integrations/twitch/user-client.ts";
import authOauth from "#server/middlewares/auth-oauth.ts";
import authToken from "#server/middlewares/auth-token.ts";
import { handleClipCreated } from "#server/services/clipper/create-clip.service.ts";
import { isValidDiscordWebhookUrl } from "#lib/discord/webhook.ts";
import { getTwitchUserById } from "#server/integrations/twitch/api/users.ts";

interface IContext extends H3EventContext {
    userId: string;
    channelId: string;
    oauth: OAuthData;
}

export default defineHandler({
    middleware: [authToken, authOauth],

    handler: async (event) => {
        const { userId, channelId, oauth } = event.context as IContext;

        const webhookUrlParam = event.url.searchParams.get("webhook");
        const webhookUrl = webhookUrlParam
            ? decodeURIComponent(webhookUrlParam)
            : undefined;

        // searchParams.get returns null when the param is absent.
        // Some chatbots (e.g. Nightbot) send the literal string "null" when
        // a user omits an argument, so we guard against that too.
        const titleParam = event.url.searchParams.get("title");
        const durationParam = event.url.searchParams.get("duration");

        try {
            // Build request body - broadcaster_id is required, title and duration are optional
            const bodyParams: Record<string, string> = {
                broadcaster_id: channelId,
            };

            // Use provided title or generate a dynamic default.
            // Reject null, undefined, empty string, and the string "null" sent by chatbots.
            if (titleParam && titleParam !== "null" && titleParam !== "undefined") {
                bodyParams.title = titleParam;
            } else {
                // Default title uses the creator's display name and login
                const user = await getTwitchUserById(userId);
                const displayName = user?.display_name ?? userId;
                const login = user?.login ?? userId;
                bodyParams.title = `Clipe de ${displayName} (@${login})`;
            }

            // Same guard for duration: reject "null" and "undefined" strings.
            if (durationParam && durationParam !== "null" && durationParam !== "undefined") {
                const duration = parseFloat(durationParam);
                if (!isNaN(duration)) {
                    bodyParams.duration = String(duration);
                }
            }

            // Create a user-specific fetch client with the user's OAuth token
            const userTwitchFetch = createUserTwitchFetch(oauth.accessToken);

            const data = await userTwitchFetch<{
                data: Array<{ id: string; edit_url: string }>;
            }>(TWITCH_ENDPOINTS.clips, {
                method: "POST",
                body: new URLSearchParams(bodyParams),
            });

            const clipData = data?.data;

            if (!clipData || clipData.length === 0) {
                return messages.clipNoData;
            }

            const clip = clipData[0];

            if (webhookUrl && isValidDiscordWebhookUrl(webhookUrl)) {
                event.waitUntil(handleClipCreated(clip.id, webhookUrl));
            }

            return messages.createdClip(clip.edit_url);
        } catch (e: unknown) {
            // Handle rate limit errors by returning a retry message for chatbots
            if (e instanceof TwitchRateLimitError) {
                return messages.rateLimited(e.retryAfter);
            }

            // Log error for debugging (not exposed to client)
            console.error("Error creating clip:", e);
            return messages.clipInternal;
        }
    },
});
