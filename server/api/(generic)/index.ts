import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
    return { status: "Running", description: "Service is up and running." };
}, { swr: true, maxAge: 60 });
