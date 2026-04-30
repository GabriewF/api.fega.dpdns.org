import { STORAGE_KEYS } from "#lib/clipper/storage-keys.ts";
import type { AppAccessToken, DeviceData, OAuthData, TokenData } from "#server/integrations/twitch/types.ts";
import { useStorage } from "nitro/storage";

export const clipperAppStorage = useStorage<AppAccessToken>(STORAGE_KEYS.PROC);

export const clipperOAuthStorage = useStorage<OAuthData>(STORAGE_KEYS.AUTH);
export const clipperDeviceStorage = useStorage<DeviceData>(STORAGE_KEYS.CODE);
export const clipperChannelKeys = useStorage<TokenData>(STORAGE_KEYS.KEYS);
