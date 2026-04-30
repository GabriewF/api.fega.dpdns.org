# AGENTS.md - Context Guide for AI Agents

## 🎯 Project Overview
Personal API for creating Twitch clips with Discord integration, hosted at `api.fega.dpdns.org`. Focuses on lightweight, efficient service using modern edge computing technologies.
**Purpose**: Allow Twitch bots to automatically create clips and notify Discord channels.

---

## 🛠️ Tech Stack
- **Runtime**: Cloudflare Workers (edge computing)
- **Framework**: Nitro v3.0 (Web Standards approach)
- **Build Tool**: Vite v8
- **Language**: TypeScript (strict mode)
- **Storage**: Cloudflare KV (production) / Local filesystem (development)
- **Integrations**: Twitch API, Discord Webhooks
- **HTTP Client**: `ofetch` (migrated from native fetch, Nitro-bundled)

---

## 🔧 Tooling & Dependency Management
- **Toolchains**: Managed via [mise.en.dev](https://mise.en.dev) (successor to `asdf`, manages runtime/CLI tool versions)
- **Dependencies**: Managed via [aube.en.dev](https://aube.en.dev) (superset of traditional Node.js package managers)
- **Lockfile**: `bun.lock` (managed via `aube`, compatible with Bun's lockfile format)
- **Shortcuts**: `aubr` = `aube run`, `aubx` = `aube dlx`

---

## ⚠️ Nitro v3 Critical Standards
This project uses **Nitro v3** with full Web Standards compliance. Key rules:
### ✅ Use
- `event.req` / `event.res` (standard Web Request/Response)
- `event.url.searchParams` for URL parameters
- `event.context` for middleware data passing
- `defineHandler` / `defineMiddleware` for endpoints/middlewares
- `useStorage()` for storage access
- `useRuntimeConfig()` for configuration
- Pre-configured `ofetch` clients (via `ofetch.create()`) for external APIs

### ❌ Avoid (deprecated in Nitro v3)
- Legacy H3 helpers: `setResponseStatus()`, `getQuery()`, `readBody()`
- Native `fetch` for external APIs (use `ofetch` instead)

---

## 📂 Directory Structure
```
server/
├── api/                    # API endpoints
│   ├── (generic)/         # Generic routes (health check, 404)
│   │   ├── index.ts        # GET /
│   │   └── [...].ts        # Catch-all 404
│   └── clipper/           # Clip-related endpoints
│       ├── clip.get.ts    # Create clip
│       └── admin/         # Admin routes
│           ├── token.post.ts    # Generate token
│           └── token.delete.ts # Remove token
├── integrations/          # External service integrations
│   ├── discord/          # Discord webhooks
│   │   └── webhook.ts    # Webhook delivery (uses ofetch)
│   └── twitch/           # Twitch API & OAuth
│       ├── api/          # API calls
│       │   ├── clips.ts  # Fetch clips
│       │   └── users.ts  # Fetch users
│       ├── auth/         # Auth flows
│       │   ├── device.ts # Device authorization flow
│       │   ├── keys.ts   # API key generation
│       │   └── oauth.ts  # OAuth & App Access Tokens
│       ├── client.ts     # Pre-configured Twitch API client (ofetch.create())
│       ├── constants.ts  # Endpoints & scopes
│       └── types.ts      # Centralized TypeScript types
├── lib/                   # Utilities & config
│   ├── clipper/          # Storage config
│   │   ├── storage-keys.ts # Centralized storage key constants
│   │   └── storage.ts    # useStorage() bindings
│   └── twitch/           # Twitch config & messages
│       ├── config.ts     # Twitch runtime config
│       └── messages.ts   # Response messages (dead code removed: `clipError`)
├── middlewares/           # Authentication
│   ├── auth-master.ts    # Master Key validation
│   ├── auth-oauth.ts     # Twitch OAuth flow (simplified responses)
│   └── auth-token.ts     # Channel token validation
└── services/              # Business logic
    └── clipper/
        └── create-clip.service.ts  # Post-clip creation logic
```

---

## 🔗 Import Aliases
Configured in `tsconfig.json` and `package.json`:
```typescript
"#lib/*"     → "./server/lib/*"
"#server/*"  → "./server/*"
"#/*"        → "./*"
```

---

## 🔐 Authentication Flows
### 1. Channel Token (`auth-token.ts`)
- Validates token via `?token=...` query param
- Checks token access to `channel_id`
- Tokens generated via admin routes, stored in KV

### 2. Twitch OAuth (`auth-oauth.ts`)
- Uses Twitch **Device Authorization Flow**
- Stores OAuth tokens in `clipper:auth` storage
- Automatic expired token refresh
- Simplified response handling: uses `event.res.status` / `event.res.statusText` instead of manual `new Response()`

### 3. Master Key (`auth-master.ts`)
- Protects admin routes (`/clipper/admin/*`)
- Validates `X-Master-Key` header
- Configured via `NITRO_CLIPPER_MASTER_KEY`

---

## 🎬 Clip Creation
### Endpoint: `GET /clipper/clip`
**Required parameters**:
- `user_id`: Twitch user ID
- `channel_id`: Twitch channel ID
- `token`: Access token

**Optional parameter**:
- `webhook`: Discord webhook URL

**Flow**:
1. Validate token and OAuth (middlewares)
2. Create clip via Twitch API
3. If webhook provided, send async notification via `event.waitUntil()`
4. Return clip edit URL

---

## 💾 Storage & Environments
### Production (Cloudflare Workers)
```typescript
storage: {
  "clipper:auth": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Auth/" },
  "clipper:code": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Code/" },
  "clipper:keys": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Keys/" },
  "clipper:proc": { driver: "cloudflare-kv-binding", binding: "CLIPPER", base: "Clipper#Proc/" },
}
```

### Development (Local)
```typescript
storage: {
  "clipper:auth": { driver: "fs", base: "clipper/auth/" },
  "clipper:code": { driver: "fs", base: "clipper/code/" },
  "clipper:keys": { driver: "fs", base: "clipper/keys/" },
  "clipper:proc": { driver: "fs", base: "clipper/proc/" },
}
```

---

## 🎨 Discord Integration
- Simple webhook delivery via `ofetch` in `server/integrations/discord/webhook.ts`
- Payload construction happens directly in `create-clip.service.ts` (unused `builder.ts` removed as dead code)
- Only validates Discord webhook URL format (trust model: webhooks configured by streamers)

---

## 🚨 Key Architectural Decisions
1. **Trusted Webhooks**: Discord webhooks are configured by streamers, so only URL format is validated (no ownership checks)
2. **Rate Limiting**: Implemented at Cloudflare domain level (`api.fega.dpdns.org`), not in code
3. **No Automated Tests**: Personal project with no reliability guarantees, focused on rapid iteration
4. **No Formal API Docs**: Maintained only by the author, README contains essential info
5. **Non-Blocking Event Loop**: Uses `event.waitUntil()` for async Cloudflare Workers processing
6. **Centralized Types**: All Twitch/API types unified in `server/integrations/twitch/types.ts` (no duplicates)
7. **Centralized Storage Keys**: All storage namespaces defined in `server/lib/clipper/storage-keys.ts`

---

## 🔧 Environment Variables
Configured in `nitro.config.ts` via `runtimeConfig`:
```typescript
runtimeConfig: {
  clipper: {
    masterKey: "__NO_KEY__",           // NITRO_CLIPPER_MASTER_KEY
    twitchClientId: "__NO_CID__",      // NITRO_CLIPPER_TWITCH_CLIENT_ID
    twitchClientSecret: "__NO_CST__",  // NITRO_CLIPPER_TWITCH_CLIENT_SECRET
  },
}
```

---

## 📦 Available Scripts
```bash
aube add <package>    # Add dependency
aube remove <package> # Remove dependency
aubr <script>        # Run package.json script (e.g., aubr dev, aubr build)
aubx <package>       # Run temporary package (e.g., aubx cowsay hi)
aubr dev             # Local development
aubr build           # Production build
aubr preview         # Local build preview
```

---

## 🎯 Tips for Agents
1. Always read this file first when exploring the codebase
2. Nitro v3 = Web Standards: avoid legacy H3 patterns
3. Storage is environment-configured in `nitro.config.ts`
4. TypeScript strict mode is enabled: leverage type safety
5. ESM only (`"type": "module"` in package.json)
6. Cloudflare Workers-compatible code required
7. No tests: do not search for test files
8. Deploy via Wrangler, configured in `nitro.config.ts` under `$production.cloudflare.wrangler`
9. Dead code removed: `StorageNamespaces` (storage-keys.ts), `builder.ts`, `clipError` (messages.ts)
10. Use pre-configured `twitchFetch` (ofetch.create()) for all Twitch API calls

---

## 📚 References
- [Nitro v3 Documentation](https://nitro.build)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Twitch API](https://dev.twitch.tv/docs/api/)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [ofetch Documentation](https://github.com/unjs/ofetch)

---

## 📚 AI-Optimized Documentation (llms.txt)
These files follow the `llms.txt` standard for AI agents to retrieve up-to-date docs:
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/llms.txt
- **Nitro v3**: http://nitro.build/llms.txt

---

## 📝 Recent Changes (2026-04-29)
- Removed dead code: `StorageNamespaces` export, deleted `builder.ts`, removed unused `clipError` message
- Migrated all external API calls to `ofetch` (Twitch, Discord)
- Simplified `auth-oauth.ts` response handling to use Nitro v3 Web Standards
- Centralized all Twitch types and storage key constants

---

**Last updated**: 29/04/2026
**Maintainer**: @GabriewF
