import type { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";

export async function sendDiscordWebhook(
    webhookUrl: string,
    payload: RESTPostAPIWebhookWithTokenJSONBody
) {
    await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    }).catch(() => { });
}
