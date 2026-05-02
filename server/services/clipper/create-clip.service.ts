import type { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { sendDiscordWebhook } from "#server/integrations/discord/webhook.ts";
import { getTwitchClipById } from "#server/integrations/twitch/api/clips.ts";
import {
    getTwitchUserById,
    getTwitchUserByLogin,
} from "#server/integrations/twitch/api/users.ts";

export async function handleClipCreated(
    clipId: string,
    webhookUrl: string,
): Promise<void> {
    // Does actually verifies if both values are not empty.
    if (!webhookUrl || !clipId) return;

    const clip = await getTwitchClipById(clipId);
    if (!clip) return;

    const broadcasterUser = await getTwitchUserById(clip.broadcaster_id);
    const clipperUser = await getTwitchUserByLogin(clip.creator_name);

    const timestamp = Math.floor(new Date(clip.created_at).getTime() / 1000);
    const spacer = "~~" + " ".repeat(40) + "~~";

    const payload: RESTPostAPIWebhookWithTokenJSONBody = {
        username: clipperUser?.display_name,
        avatar_url: clipperUser?.profile_image_url,

        content: [
            `> 🎬 **${clip.broadcaster_name}** em destaque`,
            `> ✂️ Clipado por **\`@${clip.creator_name}\`**`,
            `> 🕒 **<t:${timestamp}:f>** _(<t:${timestamp}:R>)_`,
            ``,
            `${spacer} [[🎥 **ASSISTIR CLIP**]](${clip.url}) ${spacer}`,
        ].join("\n"),
    };

    await sendDiscordWebhook(webhookUrl, payload);
}
