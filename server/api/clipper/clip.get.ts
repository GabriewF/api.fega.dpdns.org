// api/clipper/clip.get.ts
import type { H3EventContext } from "h3";
import { defineHandler } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";
import { $fetch, FetchError } from "ofetch";

import { TWITCH_ENDPOINTS } from "#lib/twitch/constants.ts";
import { messages } from "#lib/twitch/messages.ts";
import type { TwitchClipResponse } from "#lib/twitch/types.js";
import authToken from "#server/middlewares/auth-token.ts";
import authOauth from "#server/middlewares/auth-oauth.ts";

interface IContext extends H3EventContext {
    channelId: string;
    oauth: Record<string, string>;
};


export default defineHandler({
    middleware: [authToken, authOauth],

    handler: async (event) => {
        const { channelId, oauth } = <IContext> event.context;
        const { clipper } = useRuntimeConfig();

        try {
            const { data } = await $fetch<TwitchClipResponse>(TWITCH_ENDPOINTS.clips, {
                method: "POST",
                body: new URLSearchParams({ broadcaster_id: channelId }),

                headers: {
                    "Authorization": `Bearer ${oauth.accessToken}`,
                    "Client-Id": clipper.twitchClientId,
                },
            });

            const clip = data.at(0);

            if (!clip)
                return messages.clipNoData;

            return clip.edit_url;
        } catch (e) {
            if (e instanceof FetchError)
                return messages.clipError;

            return messages.clipInternal;
        }
    }
});
