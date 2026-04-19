import { useRuntimeConfig } from "nitro/runtime-config";

export function getTwitchConfig() {
    const { clipper } = useRuntimeConfig();

    return {
        clientId: clipper.twitchClientId,
        clientSecret: clipper.twitchClientSecret
    };
}
