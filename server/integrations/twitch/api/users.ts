import { twitchFetch } from "#server/integrations/twitch/client.ts";
import type { TwitchUser, TwitchUsersResponse } from "#server/integrations/twitch/types.ts";

export async function resolveTwitchChannels(
  channels: string[],
): Promise<TwitchUser[]> {
  const query: Record<string, string[]> = { id: [], login: [] };

  for (const channel of channels) {
    if (/^\d+$/.test(channel)) {
      query.id.push(channel);
    } else {
      query.login.push(channel);
    }
  }

  if (!query.id.length) delete query.id;
  if (!query.login.length) delete query.login;

  const { data } = await twitchFetch<TwitchUsersResponse>("/users", {
    query,
  });
  return data;
}

export async function getTwitchUserById(
  userId: string,
): Promise<TwitchUser | null> {
  const res = await twitchFetch<TwitchUsersResponse>("/users", {
    query: { id: userId },
  });

  return res?.data?.[0] ?? null;
}
