import { clipperChannelKeys } from "#lib/clipper/storage.ts";
import authMaster from "#server/middlewares/auth-master.ts";
import { defineHandler, HTTPError } from "nitro";

export default defineHandler({
  middleware: [authMaster],

  handler: async (event) => {
    const token = await event.req.text();

    if (!token)
      throw new HTTPError("Missing token", {
        status: 400,
        statusText: "Bad Request",
      });

    if ((await clipperChannelKeys.hasItem(token)) == false)
      throw new HTTPError("Invalid token", {
        status: 404,
        statusText: "Not Found",
      });
    await clipperChannelKeys.removeItem(token);

    event.res.status = 200;
    event.res.statusText = "SUCCESS";

    return { operation: "SUCCESS", message: "Token successfully removed" };
  },
});
