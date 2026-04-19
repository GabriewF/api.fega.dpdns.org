import { $fetch, FetchError } from "ofetch";

import { getTwitchConfig } from "#lib/twitch/config.ts";
import { TWITCH_ENDPOINTS, TWITCH_GRANT_TYPES, TWITCH_SCOPES } from "#lib/twitch/constants.ts";
import { getTokenInfo, revokeToken } from "#lib/twitch/oauth.ts";
import { authStorage, deviceStorage } from "#lib/twitch/storages.ts";
import type { DeviceData, OAuthData, TwitchDeviceResponse, TwitchTokenResponse } from "#lib/twitch/types.d.ts";

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

    return await deviceStorage.setItem(userId, device)
        .then(() => device);
}

export async function pollDeviceCode(userId: string): Promise<OAuthData | DeviceData | null> {
    const device = await deviceStorage.getItem(userId);

    { // Safe-guards
        if (!device)
            return null;

        if (Date.now() >= device.expiresAt) {
            await deviceStorage.removeItem(userId);
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
            await deviceStorage.removeItem(userId);
            return null;
        }

        const oauth: OAuthData = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };

        await authStorage.setItem(userId, oauth);
        await deviceStorage.removeItem(userId);

        return oauth;
    } catch (e) {
        if (e instanceof FetchError && e.status === 400)
            return device;

        return device;
    }
}
