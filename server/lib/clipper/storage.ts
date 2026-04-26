import { useStorage } from "nitro/storage";

import type { AppAccessToken, DeviceData, OAuthData, TokenData } from "#server/integrations/twitch/types.js";

export const clipperAppStorage = useStorage<AppAccessToken>("clipper:proc");

export const clipperOAuthStorage = useStorage<OAuthData>("clipper:auth");
export const clipperDeviceStorage = useStorage<DeviceData>("clipper:code");
export const clipperChannelKeys = useStorage<TokenData>("clipper:keys");
