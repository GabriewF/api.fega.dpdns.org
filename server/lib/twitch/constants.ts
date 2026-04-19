const API_BASE = "https://api.twitch.tv";
const ID_BASE = "https://id.twitch.tv";

export const OAUTH_BASE = `${ID_BASE}/oauth2`;
export const HELIX_BASE = `${API_BASE}/helix`;

export const TWITCH_ENDPOINTS = {
    validate: `${OAUTH_BASE}/validate`,
    token: `${OAUTH_BASE}/token`,
    device: `${OAUTH_BASE}/device`,
    revoke: `${OAUTH_BASE}/revoke`,

    clips: `${HELIX_BASE}/clips`,
    users: `${HELIX_BASE}/users`,
} as const;

export const TWITCH_SCOPES = {
    clips: "clips:edit",
} as const;

export const TWITCH_GRANT_TYPES = {
    clientCredentials: "client_credentials",
    refreshToken: "refresh_token",
    deviceCode: "urn:ietf:params:oauth:grant-type:device_code",
} as const;
