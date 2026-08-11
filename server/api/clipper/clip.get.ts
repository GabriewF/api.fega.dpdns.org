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
import { parseClipCommand } from "#lib/clipper/parser.ts";

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

        const rawQuery = event.url.searchParams.get("query");

        const queryInput =
            rawQuery && rawQuery !== "null" && rawQuery !== "undefined"
                ? rawQuery
                : "";

        try {
            const parsedArgs = parseClipCommand(queryInput);

            const bodyParams: Record<string, string> = {
                broadcaster_id: channelId,
            };

            if (parsedArgs.duration !== undefined) {
                bodyParams.duration = String(parsedArgs.duration);
            }

            if (parsedArgs.title) {
                bodyParams.title = parsedArgs.title;
            } else {
                const user = await getTwitchUserById(userId);
                const displayName = user?.display_name ?? userId;
                const login = user?.login ?? userId;
                bodyParams.title = `Clipe de ${displayName} (@${login})`;
            }

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
            if (e instanceof Error && !(e instanceof TwitchRateLimitError)) {
                // return e.message;
            }

            if (e instanceof TwitchRateLimitError) {
                return messages.rateLimited(e.retryAfter);
            }

            console.error("Error creating clip:", e);
            return messages.clipInternal;
        }
    },
});
