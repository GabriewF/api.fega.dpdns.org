import { twitchFetch } from "#server/integrations/twitch/client.ts";

export async function getTwitchClipById(clipId: string) {
    const res = await twitchFetch("/clips", {
        query: { id: clipId },
    });

    return res?.data?.[0] ?? null;
}
