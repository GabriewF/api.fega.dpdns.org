import { defineHandler, HTTPError } from "nitro";

import { keyStorage } from "#lib/twitch/storages.ts";
import authMaster from "#server/middlewares/auth-master.ts";

export default defineHandler({
    middleware: [authMaster],
    handler: async (event) => {
        const token = await event.req.text();

        if (!token)
            throw new HTTPError("Missing token", { status: 400, statusText: "Bad Request" });

        if (await keyStorage.hasItem(token) == false)
            throw new HTTPError("Invalid token", { status: 404, statusText: "Not Found" });

        return await keyStorage.removeItem(token)
            .then(() => event.res.status = 200)
            .then(() => ({ operation: "SUCCESS", message: "Token successfully removed" }));
    }
});
