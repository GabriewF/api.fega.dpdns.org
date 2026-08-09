import { defineHandler, HTTPError } from "nitro";
import { clipperChannelKeys } from "#lib/clipper/storage.ts";
import authMaster from "#server/middlewares/auth-master.ts";

export default defineHandler({
    middleware: [authMaster],

    handler: async ({ req }) => {
        const token = await req.text();

        if (!token)
            throw new HTTPError({
                message: "Missing token",
                status: 400,
            });

        if (!(await clipperChannelKeys.hasItem(token)))
            throw new HTTPError({
                message: "Invalid token",
                status: 404,
            });

        await clipperChannelKeys.removeItem(token, { removeMeta: true });

        return {
            operation: "SUCCESS",
            message: "Token successfully removed",
        };
    },
});
