import { getAppAccessToken } from "#server/integrations/twitch/auth/oauth.ts";
import { HELIX_BASE } from "#server/integrations/twitch/constants.ts";
import { useRuntimeConfig } from "nitro/runtime-config";
import { $fetch } from "ofetch";

/**
 * Create a pre-configured fetch client for Twitch Helix API
 * Uses ofetch.create() with automatic App Access Token injection
 */
export const twitchFetch = $fetch.create({
  baseURL: HELIX_BASE,
  async onRequest({ options }) {
    const { clipper } = useRuntimeConfig();
    const token = await getAppAccessToken();

    options.headers.set("Client-Id", clipper.twitchClientId);
    options.headers.set("Authorization", `Bearer ${token}`);
  },
});
