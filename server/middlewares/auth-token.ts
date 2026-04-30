import { clipperChannelKeys } from "#lib/clipper/storage.ts";
import { defineMiddleware, HTTPError } from "nitro";

export default defineMiddleware(async (event, next) => {
  const token = event.url.searchParams.get("token");
  const channelId = event.url.searchParams.get("channel_id");

  if (!token || !channelId) {
    throw new HTTPError("Missing parameters", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const tokenData = await clipperChannelKeys.getItem<{ channels: string[] }>(
    token,
  );

  if (!tokenData) {
    throw new HTTPError("Invalid token", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  if (!tokenData.channels.includes(channelId)) {
    throw new HTTPError("Token does not include this channel ID", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  event.context.channelId = channelId;
  return next();
});
