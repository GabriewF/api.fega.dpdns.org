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

export interface AppAccessToken {
    accessToken: string;
    expiresAt: number;
}

// Twitch API Response Types
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

export interface TwitchAppTokenResponse {
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

// Twitch Data Models
export interface TwitchClip {
    id: string;
    url: string;
    edit_url: string;
    broadcaster_id: string;
    broadcaster_name: string;
    creator_name: string;
    created_at: string;
    thumbnail_url: string;
}

export interface TwitchClipResponse {
    data: TwitchClip[];
}

export interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    profile_image_url?: string;
}

export interface TwitchUsersResponse {
    data: TwitchUser[];
}
