import { clipperOAuthStorage } from "#lib/clipper/storage.ts";
import { messages } from "#lib/twitch/messages.ts";
import { pollDeviceCode, startDeviceFlow } from "#server/integrations/twitch/auth/device.ts";
import { isOAuth, refreshToken, validateToken } from "#server/integrations/twitch/auth/oauth.ts";
import { defineMiddleware, HTTPError } from "nitro";

export default defineMiddleware(async (event, next) => {
  const userId = event.url.searchParams.get("user_id");

  if (!userId) {
    throw new HTTPError("Missing parameters", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  let oAuth = await clipperOAuthStorage.getItem(userId);

  // Verifies OAuth
  if (oAuth) {
    const valid = await validateToken(oAuth.accessToken);

    if (!valid) {
      const refreshResult = await refreshToken(userId, oAuth.refreshToken);

      if (refreshResult) {
        oAuth = refreshResult;
      } else {
        await clipperOAuthStorage.removeItem(userId);
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
        const device = result ?? (await startDeviceFlow(userId));
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

  return await next();
});
