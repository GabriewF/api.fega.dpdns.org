import { useRuntimeConfig } from "nitro/runtime-config";
import { $fetch, type FetchError } from "ofetch";
import { HELIX_BASE } from "#server/integrations/twitch/constants.ts";

/**
 * Custom error thrown when Twitch API rate limit is hit
 */
export class TwitchRateLimitError extends Error {
    public retryAfter: number;

    constructor(retryAfter: number) {
        super("Twitch API rate limit exceeded");
        this.name = "TwitchRateLimitError";
        this.retryAfter = retryAfter;
    }
}

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
        // Intercept rate limit errors and throw with retry info
        async onResponseError({ response }) {
            const retryAfter = response.headers.get("Ratelimit-Reset") || response.headers.get("Retry-After");

            if (response.status === 429 && retryAfter) {
                const retrySeconds = parseInt(retryAfter, 10);
                if (!isNaN(retrySeconds)) {
                    throw new TwitchRateLimitError(retrySeconds);
                }
            }
        },
    });
}
