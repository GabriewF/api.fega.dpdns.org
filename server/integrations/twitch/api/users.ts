import { twitchFetch } from "#server/integrations/twitch/client.ts";
import type {
    TwitchUser,
    TwitchUsersResponse,
} from "#server/integrations/twitch/types.ts";

const MAX_USERS_PER_REQUEST = 100;

async function fetchUserBatch(
    ids: string[],
    logins: string[],
): Promise<TwitchUser[]> {
    const query: Record<string, string[]> = {};

    if (ids.length > 0) query.id = ids;
    if (logins.length > 0) query.login = logins;

    const { data } = await twitchFetch<TwitchUsersResponse>("/users", {
        query,
    });
    return data;
}

export async function resolveTwitchChannels(
    channels: string[],
): Promise<TwitchUser[]> {
    const ids: string[] = [];
    const logins: string[] = [];

    // Separate channels into IDs and logins
    for (const channel of channels) {
        if (/^\d+$/.test(channel)) {
            ids.push(channel);
        } else {
            logins.push(channel);
        }
    }

    const allUsers: TwitchUser[] = [];
    let idIndex = 0;
    let loginIndex = 0;

    // Process in batches where total (ids + logins) <= 100
    while (idIndex < ids.length || loginIndex < logins.length) {
        const batchIds: string[] = [];
        const batchLogins: string[] = [];
        let batchCount = 0;

        // Fill batch with IDs first
        while (idIndex < ids.length && batchCount < MAX_USERS_PER_REQUEST) {
            batchIds.push(ids[idIndex]);
            idIndex++;
            batchCount++;
        }

        // Fill remaining slots with logins
        while (
            loginIndex < logins.length &&
            batchCount < MAX_USERS_PER_REQUEST
        ) {
            batchLogins.push(logins[loginIndex]);
            loginIndex++;
            batchCount++;
        }

        // Fetch this batch
        const users = await fetchUserBatch(batchIds, batchLogins);
        allUsers.push(...users);
    }

    return allUsers;
}

export async function getTwitchUserById(
    userId: string,
): Promise<TwitchUser | null> {
    const res = await twitchFetch<TwitchUsersResponse>("/users", {
        query: { id: userId },
    });

    return res.data[0] ?? null;
}
