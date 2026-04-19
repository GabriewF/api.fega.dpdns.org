import { defineCachedHandler } from "nitro/cache";

export default defineCachedHandler((event) => {
    event.res.status = 404;
    event.res.statusText = "Route Not Found";

    return { message: "Route Not Found" };
}, { staleMaxAge: 60, maxAge: 43200 });
