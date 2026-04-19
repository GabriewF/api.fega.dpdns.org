// lib/twitch/client.ts
import { useRuntimeConfig } from "nitro/runtime-config";
import { createFetch, FetchError } from "ofetch";

import { HELIX_BASE } from "#lib/twitch/constants.ts";
import { getAppAccessToken } from "#lib/twitch/oauth.ts";

export const twitchFetch = createFetch({
    defaults: {
        baseURL: HELIX_BASE,

        async onRequest({ options }) {
            const { clipper } = useRuntimeConfig();
            const token = await getAppAccessToken();

            options.headers.set("Client-Id", clipper.twitchClientId);
            options.headers.set("Authorization", `Bearer ${token}`);
        },
    },
});

export { FetchError };
