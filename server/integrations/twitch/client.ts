// lib/twitch/client.ts
import { useRuntimeConfig } from "nitro/runtime-config";
import { createFetch, FetchError } from "ofetch";

import { getAppAccessToken } from "#server/integrations/twitch/auth/oauth.ts";
import { HELIX_BASE } from "#server/integrations/twitch/constants.ts";

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
