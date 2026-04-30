import { messages } from "#lib/twitch/messages.ts";
import { twitchFetch } from "#server/integrations/twitch/client.ts";
import { TWITCH_ENDPOINTS } from "#server/integrations/twitch/constants.ts";
import type { OAuthData } from "#server/integrations/twitch/types.ts";
import authOauth from "#server/middlewares/auth-oauth.ts";
import authToken from "#server/middlewares/auth-token.ts";
import { handleClipCreated } from "#server/services/clipper/create-clip.service.ts";
import { defineHandler } from "nitro";

interface IContext {
  userId: string;
  channelId: string;
  oauth: OAuthData;
}

export default defineHandler({
  middleware: [authToken, authOauth],

  handler: async (event) => {
    const { channelId, oauth } = event.context as unknown as IContext;

    const webhookUrlParam = event.url.searchParams.get("webhook");
    const webhookUrl = webhookUrlParam ? decodeURIComponent(webhookUrlParam) : "";

    try {
      const response = await twitchFetch<{ data: Array<{ id: string; edit_url: string }> }>(
        TWITCH_ENDPOINTS.clips,
        {
          method: "POST",
          body: new URLSearchParams({
            broadcaster_id: channelId,
          }),
        },
      );

      const { data } = response;
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
            event.waitUntil(
              handleClipCreated(clip.id, webhookUrl),
            );
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
