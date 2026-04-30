import { clipperDeviceStorage, clipperOAuthStorage } from "#lib/clipper/storage.ts";
import { getTwitchConfig } from "#lib/twitch/config.ts";
import { getTokenInfo, revokeToken } from "#server/integrations/twitch/auth/oauth.ts";
import { TWITCH_ENDPOINTS, TWITCH_GRANT_TYPES, TWITCH_SCOPES } from "#server/integrations/twitch/constants.ts";
import type { DeviceData, OAuthData, TwitchDeviceResponse, TwitchTokenResponse } from "#server/integrations/twitch/types.ts";
import { $fetch } from "ofetch";

export async function startDeviceFlow(userId: string): Promise<DeviceData> {
  const { clientId } = getTwitchConfig();

  const data = await $fetch<TwitchDeviceResponse>(TWITCH_ENDPOINTS.device, {
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      scopes: TWITCH_SCOPES.clips,
    }),
  });

  const device: DeviceData = {
    deviceCode: data.device_code,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return await clipperDeviceStorage.setItem(userId, device).then(() => device);
}

export async function pollDeviceCode(
  userId: string,
): Promise<OAuthData | DeviceData | null> {
  const device = await clipperDeviceStorage.getItem(userId);

  {
    // Safe-guards
    if (!device) return null;

    if (Date.now() >= device.expiresAt) {
      await clipperDeviceStorage.removeItem(userId);
      return null;
    }
  }

  try {
    const { clientId, clientSecret } = getTwitchConfig();

    const data = await $fetch<TwitchTokenResponse>(TWITCH_ENDPOINTS.token, {
      method: "POST",
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        device_code: device.deviceCode,
        grant_type: TWITCH_GRANT_TYPES.deviceCode,
      }),
    });

    const info = await getTokenInfo(data.access_token);

    if (!info || info.user_id !== userId) {
      await revokeToken(data.access_token);
      await clipperDeviceStorage.removeItem(userId);
      return null;
    }

    const oauth: OAuthData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    await clipperOAuthStorage.setItem(userId, oauth);
    await clipperDeviceStorage.removeItem(userId);

    return oauth;
  } catch {
    // Ignore fetch errors, return device for polling
    return device;
  }
}
