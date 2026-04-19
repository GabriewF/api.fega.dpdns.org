// middleware/00.auth-master.ts
import { defineMiddleware, HTTPError } from "nitro";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineMiddleware(({ req }) => {
    const key = req.headers.get("X-Master-Key");
    const { clipper } = useRuntimeConfig();

    if (!key)
        throw new HTTPError("Missing MASTER_KEY", { status: 401, statusText: "Unauthorized" });

    if (key !== clipper.masterKey)
        throw new HTTPError("Invalid MASTER_KEY", { status: 403, statusText: "Forbidden" });
});
