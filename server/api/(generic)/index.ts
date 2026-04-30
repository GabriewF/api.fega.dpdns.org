import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
  event.res.status = 200;
  event.res.statusText = "UP";

  return { status: "UP", description: "Service is up and running." };
});
