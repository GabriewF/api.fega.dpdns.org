import { twitchFetch } from "#server/integrations/twitch/client.ts";

export interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
}

export async function resolveTwitchChannels(channels: string[]): Promise<TwitchUser[]> {
    const query: Record<string, string[]> = { id: [], login: [] };

    for (const channel of channels) {
        if (/^\d+$/.test(channel))
            query.id.push(channel);
        else
            query.login.push(channel);
    }

    if (!query.id.length)
        delete query.id;

    if (!query.login.length)
        delete query.login;


    const { data } = await twitchFetch<{ data: TwitchUser[]; }>("/users", { query });
    return data;
}
