import { defineMiddleware, HTTPError } from "nitro/h3";

import { pollDeviceCode, startDeviceFlow } from "#lib/twitch/device.ts";
import { messages } from "#lib/twitch/messages.ts";
import { isOAuth, refreshToken, validateToken } from "#lib/twitch/oauth.ts";
import { authStorage } from "#lib/twitch/storages.ts";


export default defineMiddleware(async (event, next) => {
    const userId = event.url.searchParams.get("user_id");

    if (!userId)
        throw new HTTPError("Missing parameters", { status: 400, statusText: "Bad Request " });

    let oAuth = await authStorage.getItem(userId);

    // Verifies OAuth
    if (oAuth) {
        const valid = await validateToken(oAuth.accessToken);

        if (!valid) {
            const refreshed = await refreshToken(userId, oAuth.refreshToken);

            if (refreshed) {
                oAuth = refreshed;
            } else {
                await authStorage.removeItem(userId);
                oAuth = null;
            }
        }
    }

    // Invalid Oauth case.
    if (!oAuth) {
        try {
            const result = await pollDeviceCode(userId);

            if (result && isOAuth(result)) {
                oAuth = result;
            } else {
                const device = result ?? await startDeviceFlow(userId);
                const msg = result ? messages.authPending : messages.authRequired;

                event.res.status = 200;
                event.res.statusText = "Missing Authorization";

                return msg(device.verificationUri, device.userCode);
            }
        } catch {
            event.res.status = 200;
            event.res.statusText = "Authorization Error";

            return messages.authError;
        }
    }

    event.context.userId = userId;
    event.context.oauth = oAuth;
});
