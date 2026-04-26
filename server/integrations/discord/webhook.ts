import type { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { $fetch } from "ofetch";

export async function sendDiscordWebhook(
    webhookUrl: string,
    payload: RESTPostAPIWebhookWithTokenJSONBody
) {
    const res = await $fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
    }).catch(() => { });

    console.log(res);
}
