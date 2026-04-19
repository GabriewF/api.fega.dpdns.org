export interface OAuthData {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
}

export interface DeviceData {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    expiresAt: number;
}

export interface TokenData {
    channels: string[];
}

export interface TwitchTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface TwitchDeviceResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
}

export interface TwitchClipResponse {
    data: Array<{ id: string; edit_url: string; }>;
}


interface AppAccessToken {
    accessToken: string;
    expiresAt: number;
}

interface TwitchAppTokenResponse {
    access_token: string;
    expires_in: number;
}

export interface TwitchValidateResponse {
    client_id: string;
    login: string;
    user_id: string;
    scopes: string[];
    expires_in: number;
}
