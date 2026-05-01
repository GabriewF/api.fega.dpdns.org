import { useRuntimeConfig } from "nitro/runtime-config";
import { $fetch } from "ofetch";
import { HELIX_BASE } from "#server/integrations/twitch/constants.ts";

/**
 * Create a pre-configured fetch client for Twitch Helix API using user's OAuth token
 * @param userAccessToken - The user's OAuth access token
 */
export function createUserTwitchFetch(userAccessToken: string) {
    const { clipper } = useRuntimeConfig();

    return $fetch.create({
        baseURL: HELIX_BASE,
        headers: {
            "Client-Id": clipper.twitchClientId,
            Authorization: `Bearer ${userAccessToken}`,
        },
    });
}
