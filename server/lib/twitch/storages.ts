import { useStorage } from "nitro/storage";

import type { AppAccessToken, DeviceData, OAuthData, TokenData } from "#lib/twitch/types.d.ts";

export const procStorage = useStorage<AppAccessToken>("clipper:proc");

export const authStorage = useStorage<OAuthData>("clipper:auth");
export const deviceStorage = useStorage<DeviceData>("clipper:code");
export const keyStorage = useStorage<TokenData>("clipper:keys");
