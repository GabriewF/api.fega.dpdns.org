import { defineHandler } from "nitro";

export default defineHandler((event) => {
  event.res.status = 404;
  event.res.statusText = "Route Not Found";

  // TODO: make a better message
  return { message: "Route Not Found" };
});
