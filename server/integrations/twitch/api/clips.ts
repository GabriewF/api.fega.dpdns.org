import { twitchFetch } from "#server/integrations/twitch/client.ts";
import type { TwitchClip, TwitchClipResponse } from "#server/integrations/twitch/types.ts";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getTwitchClipById(
  clipId: string,
  maxRetries = 3,
): Promise<TwitchClip | null> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await twitchFetch<TwitchClipResponse>("/clips", {
      query: { id: clipId },
    });

    const clip = res.data[0] ?? null;

    if (clip)
      return clip;

    // If not found and still has retries, wait 10s
    if (attempt < maxRetries) {
      await sleep(10_000);
    }
  }

  return null;
}
