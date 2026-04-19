
import { defineHandler, HTTPError } from "nitro";

import { FetchError } from "#lib/twitch/client.ts";
import { generateApiKey } from "#lib/twitch/keys.ts";
import { keyStorage } from "#lib/twitch/storages.ts";
import { resolveTwitchChannels } from "#lib/twitch/users.ts";

function assertStringChannels(arr: FormDataEntryValue[]): asserts arr is string[] {
    for (const item of arr) {
        if (typeof item !== "string")
            throw new HTTPError("All channels need to be ID strings", { status: 400 });
    }
}

export default defineHandler(async (event) => {
    const body = await event.req.formData()
        .catch((err) => { throw new HTTPError("Invalid body", { status: 400, cause: err }); });

    const channels = body.getAll("channel");

    if (channels.length < 1)
        throw new HTTPError("At least one channel is necessary", { status: 400 });

    assertStringChannels(channels);

    const resolved = await resolveTwitchChannels(channels).catch((err) => {
        if (err instanceof FetchError)
            throw new HTTPError(`Twitch API error: ${err.status}`, { status: 502, cause: err });

        throw new HTTPError("Failed to verify channels", { status: 502, cause: err });
    });

    if (resolved.length !== channels.length) {
        const foundLogins = new Set(resolved.map(u => u.login.toLowerCase()));
        const foundIds = new Set(resolved.map(u => u.id));

        const notFound = channels.filter(c =>
            /^\d+$/.test(c) ? !foundIds.has(c) : !foundLogins.has(c.toLowerCase())
        );

        throw new HTTPError(`Channels not found: ${notFound.join(", ")}`, { status: 404 });
    }

    const channelIds = resolved.map(u => u.id);
    const token = generateApiKey();

    await keyStorage.setItem(token, { channels: channelIds }, {});

    return Response.json({
        token,
        channels: resolved.map(u => ({ id: u.id, login: u.login })),
    });
});
