import type { H3EventContext } from "h3";
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";
import { $fetch, FetchError } from "ofetch";

import { messages } from "#lib/twitch/messages.ts";
import { TWITCH_ENDPOINTS } from "#server/integrations/twitch/constants.ts";
import type { TwitchClipResponse } from "#server/integrations/twitch/types.ts";

import authOauth from "#server/middlewares/auth-oauth.ts";
import authToken from "#server/middlewares/auth-token.ts";

import { handleClipCreated } from "#server/services/clipper/create-clip.service.ts";

interface IContext extends H3EventContext {
    channelId: string;
    oauth: Record<string, string>;
}

export default defineHandler({
    middleware: [authToken, authOauth],

    handler: async (event) => {
        const { channelId, oauth } = event.context as IContext;
        const { clipper } = useRuntimeConfig();

        const webhookUrl = event.url.searchParams.get("webhook");

        try {
            const { data } = await $fetch<TwitchClipResponse>(TWITCH_ENDPOINTS.clips, {
                method: "POST",
                body: new URLSearchParams({
                    broadcaster_id: channelId,
                }),
                headers: {
                    Authorization: `Bearer ${oauth.accessToken}`,
                    "Client-Id": clipper.twitchClientId,
                },
            });

            const clip = data.at(0);

            if (!clip) return messages.clipNoData;

            if (webhookUrl) {
                const isDiscordWebhook =
                    webhookUrl.startsWith("https://discord.com/api/webhooks/");

                if (isDiscordWebhook) {
                    event.waitUntil(
                        handleClipCreated(clip.edit_url, webhookUrl)
                    );
                }
            }

            return messages.createdClip(clip.edit_url);

        } catch (e) {
            if (e instanceof FetchError) return messages.clipError;
            return messages.clipInternal;
        }
    },
});
