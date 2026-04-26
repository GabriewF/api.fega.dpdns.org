import { $fetch } from "ofetch";

import { clipperAppStorage, clipperOAuthStorage } from "#lib/clipper/storage.ts";
import { getTwitchConfig } from "#lib/twitch/config.ts";
import { TWITCH_ENDPOINTS, TWITCH_GRANT_TYPES } from "#server/integrations/twitch/constants.ts";
import type { AppAccessToken, DeviceData, OAuthData, TwitchAppTokenResponse, TwitchTokenResponse, TwitchValidateResponse } from "#server/integrations/twitch/types.ts";

export function isOAuth(data: OAuthData | DeviceData): data is OAuthData {
    return "accessToken" in data;
}

export async function validateToken(accessToken: string): Promise<boolean> {
    try {
        await $fetch(TWITCH_ENDPOINTS.validate, {
            headers: { Authorization: `OAuth ${accessToken}` },
        });

        return true;
    } catch { return false; }
}

export async function refreshToken(userId: string, refreshToken: string): Promise<OAuthData | null> {
    try {
        const { clientId, clientSecret } = getTwitchConfig();

        const data = await $fetch<TwitchTokenResponse>(TWITCH_ENDPOINTS.token, {
            method: "POST",

            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,

                grant_type: TWITCH_GRANT_TYPES.refreshToken,
            }),
        });

        const oauth: OAuthData = {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };

        await clipperOAuthStorage.setItem(userId, oauth);
        return oauth;
    } catch (e) {
        return null;
    }
}

export async function getAppAccessToken(): Promise<string> {
    const cached = await clipperAppStorage.getItem<AppAccessToken>("twitch:app_token");
    const { clientId, clientSecret } = getTwitchConfig();

    if (cached && Date.now() < cached.expiresAt)
        return cached.accessToken;

    const res = await $fetch<TwitchAppTokenResponse>(TWITCH_ENDPOINTS.token, {
        method: "POST",

        query: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: TWITCH_GRANT_TYPES.clientCredentials,
        },
    });

    const token: AppAccessToken = {
        accessToken: res.access_token,
        expiresAt: Date.now() + (res.expires_in - 60) * 1000,
    };

    await clipperAppStorage.setItem("twitch:app_token", token);

    return token.accessToken;
}

export async function getTokenInfo(accessToken: string): Promise<TwitchValidateResponse | null> {
    try {
        return await $fetch<TwitchValidateResponse>(TWITCH_ENDPOINTS.validate, {
            headers: { Authorization: `OAuth ${accessToken}` },
        });
    } catch {
        return null;
    }
}

export async function revokeToken(accessToken: string): Promise<void> {
    const { clientId } = getTwitchConfig();
    try {
        await $fetch(TWITCH_ENDPOINTS.revoke, {
            method: "POST",
            body: new URLSearchParams({ client_id: clientId, token: accessToken }),
        });
    } catch { /* melhor esforço */ }
}
