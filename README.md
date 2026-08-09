# api.fega.dpdns.org

A personal API for creating Twitch clips with Discord integration, built with Nitro v3 and deployed on Cloudflare Workers.

## ✨ Features

- Create Twitch clips via API
- Discord webhook integration for clip notifications
- Channel access token management
- Twitch OAuth2/Device authorization flow with automatic token refresh
- Rate limit handling with friendly retry messages for chatbots
- Dynamic clip titles ("Clipe de {displayName} (@{login})") when none provided
- Storage using Cloudflare KV (production) or in-memory LRU cache (development)
- Automatic health check and 404 route handling
- Non-blocking async processing with `event.waitUntil()`

## 📋 Prerequisites

- [Bun](https://bun.sh) (runtime and package manager)
- Cloudflare account (for deployment)
- Twitch application credentials (Client ID and Client Secret)

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
NITRO_CLIPPER_TWITCH_CLIENT_ID=your_twitch_client_id
NITRO_CLIPPER_TWITCH_CLIENT_SECRET=your_twitch_client_secret
NITRO_CLIPPER_MASTER_KEY=your_secure_master_key
```

## 🚀 Installation

```bash
# Clone the repository
git clone git@github.com:GabriewF/api.fega.dpdns.org.git
cd api.fega.dpdns.org

# Install dependencies
bun install
```

## 🖥️ Running Locally

```bash
bun run dev
```

The API will be available at `http://localhost:3000` (or the port configured by Vite/Nitro).

## 📡 API Endpoints

### 1. Health Check
- **GET** `/`
- **Response:** HTTP 200
  ```json
  {
    "status": "Running",
    "description": "Service is up and running."
  }
  ```

### 2. Not Found Route
- **ANY METHOD** `/*`
- **Response:** HTTP 404
  ```json
  {
    "message": "Route Not Found"
  }
  ```

### 3. Create Twitch Clip
- **GET** `/clipper/clip`
- **Required Query Parameters:**
  - `user_id`: Twitch user ID
  - `channel_id`: Twitch channel ID
  - `token`: Access token generated via admin endpoint
- **Optional Parameters:**
  - `webhook`: Discord webhook URL (must be a valid Discord URL)
  - `title`: Clip title (defaults to `"Clipe de {displayName} (@{login})"` if omitted or sent as `null`)
  - `duration`: Clip duration in seconds (defaults to Twitch's default if omitted)
- **Example Request:**
  ```bash
  curl "http://localhost:3000/clipper/clip?user_id=123&channel_id=456&token=abc123&webhook=https://discord.com/api/webhooks/..."
  ```
- **Example Response:** HTTP 200 with plain text
  ```
  Clipe criado! https://clips.twitch.tv/edit/...
  ```

### 4. Generate Access Token (Admin)
- **POST** `/clipper/admin/token`
- **Headers:** `X-Master-Key: your_master_key`
- **Body (Form Data):** `channel` (can be sent multiple times, accepts channel IDs or logins)
- **Example Request:**
  ```bash
  curl -X POST "http://localhost:3000/clipper/admin/token" \
    -H "X-Master-Key: your_key" \
    -F "channel=test_channel" \
    -F "channel=123456"
  ```
- **Example Response:** HTTP 200
  ```json
  {
    "token": "generated_token_here",
    "channels": [
      {"id": "123456", "login": "test_channel"}
    ]
  }
  ```

### 5. Remove Access Token (Admin)
- **DELETE** `/clipper/admin/token`
- **Headers:** `X-Master-Key: your_master_key`
- **Body:** Token to be removed (plain text)
- **Example Request:**
  ```bash
  curl -X DELETE "http://localhost:3000/clipper/admin/token" \
    -H "X-Master-Key: your_key" \
    -d "token_to_remove"
  ```
- **Response:** HTTP 200
  ```json
  {
    "operation": "SUCCESS",
    "message": "Token successfully removed"
  }
  ```

## 🌐 Deploy to Cloudflare

The project is configured for Cloudflare Workers deployment using Nitro. Make sure you have Wrangler installed:

```bash
bun add -g wrangler
```

Build and deploy:

```bash
bun run build
wrangler deploy
```

## 📂 Project Structure

```
.
├── server/
│   ├── api/               # API endpoints
│   │   ├── (generic)/     # Generic routes (health check, 404)
│   │   └── clipper/       # Clip-related endpoints
│   ├── integrations/      # External service integrations
│   │   ├── discord/       # Discord webhooks (uses ofetch)
│   │   └── twitch/        # Twitch API & OAuth (uses ofetch.create())
│   ├── lib/               # Utilities & configuration
│   │   ├── clipper/       # Storage keys & useStorage() bindings
│   │   └── twitch/        # Twitch config & messages
│   ├── middlewares/       # Authentication (simplified Nitro v3 responses)
│   └── services/          # Business logic (clip creation, Discord payload)
├── public/                # Public assets
├── docs/                  # API documentation
├── nitro.config.ts        # Nitro configuration
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Bun** (Runtime and package manager)
- **Nitro v3** (Web Standards-compliant framework for serverless)
- **Vite v8** (Build tool)
- **TypeScript** (strict mode)
- **Cloudflare Workers** (Edge runtime)
- **Cloudflare KV** (Storage)
- **Twitch Helix API** (with `ofetch` pre-configured client)
- **Discord Webhooks** (with `ofetch` for delivery)

## 🔐 Authentication

The API uses three authentication methods:

1. **Channel Tokens** (`auth-token.ts`): Validates `?token=...` query parameter and checks access to `channel_id`
2. **Twitch OAuth** (`auth-oauth.ts`): Device Authorization Flow with automatic token refresh, simplified response handling
3. **Master Key** (`auth-master.ts`): Protects admin routes via `X-Master-Key` header

## 🎨 Discord Integration

- Webhook URL format validation only (trust model: webhooks configured by streamers)
- Supports 6 Discord domains (discord.com, discordapp.com, PTB, and Canary variants)
- Payload construction directly in `create-clip.service.ts`
- Asynchronous notifications via `event.waitUntil()` for non-blocking clip creation

## 🚨 Key Decisions

- **No automated tests**: Personal project focused on rapid iteration
- **Rate limiting**: Implemented at Cloudflare domain level (`api.fega.dpdns.org`)
- **Centralized types**: All Twitch/API types in `server/integrations/twitch/types.ts`
- **Centralized storage keys**: Defined in `server/lib/clipper/storage-keys.ts`
- **Dead code removed**: `builder.ts`, `StorageNamespaces`, unused `clipError` message
- **Chatbot-friendly responses**: All endpoints return HTTP 200 with human-readable messages. The clip endpoint specifically returns plain text strings for chatbot display compatibility, while admin/health endpoints return JSON objects.

## 📚 References

- [Nitro v3 Documentation](https://nitro.build)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Twitch API](https://dev.twitch.tv/docs/api/)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [ofetch Documentation](https://github.com/unjs/ofetch)
- [Bun](https://bun.sh)
