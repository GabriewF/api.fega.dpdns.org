import type { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { $fetch } from "ofetch";

export async function sendDiscordWebhook(
    webhookUrl: string,
    payload: RESTPostAPIWebhookWithTokenJSONBody,
): Promise<void> {
    try {
        await $fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
        });
    } catch (error: unknown) {
        console.error("Failed to send Discord webhook:", error);
    }
}
