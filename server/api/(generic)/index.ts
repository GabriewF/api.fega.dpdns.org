import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
    return { status: "UP", description: "Service is up and running." };
});
