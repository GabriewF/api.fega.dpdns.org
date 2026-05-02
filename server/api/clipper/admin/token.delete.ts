import { defineHandler, HTTPError } from "nitro";
import { clipperChannelKeys } from "#lib/clipper/storage.ts";
import authMaster from "#server/middlewares/auth-master.ts";

export default defineHandler({
    middleware: [authMaster],

    handler: async ({ req }) => {
        const token = await req.text();

        if (!token)
            throw new HTTPError("Missing token", {
                status: 400,
                statusText: "Bad Request",
            });

        if (!(await clipperChannelKeys.hasItem(token)))
            throw new HTTPError("Invalid token", {
                status: 404,
                statusText: "Not Found",
            });

        await clipperChannelKeys.removeItem(token, { removeMeta: true });

        return {
            operation: "SUCCESS",
            message: "Token successfully removed",
        };
    },
});
