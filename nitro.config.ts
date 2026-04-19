// nitro.config.ts
import { defineConfig } from "nitro";

export default defineConfig({
  compatibilityDate: "latest",
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

        route: "api.fega.dpdns.org",
      }
    },

    storage: {
      "clipper:auth": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Auth/" },
      "clipper:code": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Code/" },
      "clipper:keys": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Keys/" },
      "clipper:proc": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Proc/" },
    },
  },

  // Development configuration
  $development: {
    sourcemap: true,

    storage: {
      "clipper:auth": { driver: "fs", base: "clipper/auth/" },
      "clipper:code": { driver: "fs", base: "clipper/code/" },
      "clipper:keys": { driver: "fs", base: "clipper/keys/" },
      "clipper:proc": { driver: "fs", base: "clipper/proc/" },
    },
  },
});
