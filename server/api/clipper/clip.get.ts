import { defineHandler } from "nitro";
import type { H3EventContext } from "nitro/h3";
import { messages } from "#lib/twitch/messages.ts";
import { TWITCH_ENDPOINTS } from "#server/integrations/twitch/constants.ts";
import type { OAuthData } from "#server/integrations/twitch/types.ts";
import { createUserTwitchFetch } from "#server/integrations/twitch/user-client.ts";
import authOauth from "#server/middlewares/auth-oauth.ts";
import authToken from "#server/middlewares/auth-token.ts";
import { handleClipCreated } from "#server/services/clipper/create-clip.service.ts";

interface IContext extends H3EventContext {
    userId: string;
    channelId: string;
    oauth: OAuthData;
}

export default defineHandler({
    middleware: [authToken, authOauth],

    handler: async (event) => {
        const { channelId, oauth } = event.context as IContext;

        const webhookUrlParam = event.url.searchParams.get("webhook");
        const webhookUrl = webhookUrlParam
            ? decodeURIComponent(webhookUrlParam)
            : undefined;

        try {
            // Create a user-specific fetch client with the user's OAuth token
            const userTwitchFetch = createUserTwitchFetch(oauth.accessToken);

            const { data } = await userTwitchFetch<{
                data: Array<{ id: string; edit_url: string }>;
            }>(TWITCH_ENDPOINTS.clips, {
                method: "POST",
                body: new URLSearchParams({
                    broadcaster_id: channelId,
                }),
            });

            if (!data || data.length === 0) {
                return messages.clipNoData;
            }

            const clip = data[0];

            if (webhookUrl) {
                try {
                    const webhookUrlObj = new URL(webhookUrl);
                    const isDiscordWebhook =
                        webhookUrlObj.hostname === "discord.com" &&
                        webhookUrlObj.pathname.startsWith("/api/webhooks/");

                    if (isDiscordWebhook) {
                        event.waitUntil(handleClipCreated(clip.id, webhookUrl));
                    }
                } catch {
                    // Invalid URL, ignore webhook
                }
            }

            return messages.createdClip(clip.edit_url);
        } catch (e: unknown) {
            // Log error for debugging (not exposed to client)
            console.error("Error creating clip:", e);
            return messages.clipInternal;
        }
    },
});
