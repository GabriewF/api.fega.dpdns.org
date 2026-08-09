import { defineHandler } from "nitro";

export default defineHandler((event) => {
    event.res.status = 404;

    // TODO: make a better message
    return { message: "Route Not Found" };
});
