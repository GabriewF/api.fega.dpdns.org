// nitro.config.ts
import { defineConfig } from "nitro";

export default defineConfig({
    preset: "cloudflare-module",
    compatibilityDate: "2026-05-01",
    serverDir: true,

    runtimeConfig: {
        clipper: {
            masterKey: "__NO_KEY__",
            twitchClientId: "__NO_CID__",
            twitchClientSecret: "__NO_CST__",
        },
    },

    typescript: {
        strict: true,
        generateRuntimeConfigTypes: true,
        generateTsConfig: true,
    },

    // Production configuration
    $production: {
        compressPublicAssets: true,
        future: { nativeSWR: true },
        minify: true,

        cloudflare: {
            deployConfig: true,
            nodeCompat: true,

            wrangler: {
                name: "api",
                kv_namespaces: [{ binding: "CLIPPER" }],

                route: {
                    pattern: "api.fega.dpdns.org",
                    custom_domain: true,
                },

                observability: {
                    enabled: true,
                    logs: { enabled: true, invocation_logs: true },
                },

                placement: { mode: "smart" },

                preview_urls: true,
                workers_dev: false,
            },
        },

        storage: {
            "clipper:auth": {
                driver: "cloudflare-kv-binding",
                binding: "CLIPPER",
                base: "Clipper#Auth/",
            },
            "clipper:code": {
                driver: "cloudflare-kv-binding",
                binding: "CLIPPER",
                base: "Clipper#Code/",
            },
            "clipper:keys": {
                driver: "cloudflare-kv-binding",
                binding: "CLIPPER",
                base: "Clipper#Keys/",
            },
            "clipper:proc": {
                driver: "cloudflare-kv-binding",
                binding: "CLIPPER",
                base: "Clipper#Proc/",
            },
        },
    },

    // Development configuration
    $development: {
        sourcemap: true,

        storage: {
            "clipper:auth": { driver: "lru-cache", base: "Clipper#Auth/" },
            "clipper:code": { driver: "lru-cache", base: "Clipper#Code/" },
            "clipper:keys": { driver: "lru-cache", base: "Clipper#Keys/" },
            "clipper:proc": { driver: "lru-cache", base: "Clipper#Proc/" },
        },
    },
});
