import { sendDiscordWebhook } from "#server/integrations/discord/webhook.ts";
import { getTwitchClipById } from "#server/integrations/twitch/api/clips.ts";

export async function handleClipCreated(
    clipUrl: string,
    webhookUrl?: string
) {
    const match = clipUrl.match(/clips\.twitch\.tv\/([^/?]+)/);
    const clipId = match?.[1];

    if (!clipId || !webhookUrl) return;

    const clip = await getTwitchClipById(clipId);
    if (!clip) return;

    await sendDiscordWebhook(webhookUrl, {
        username: "Clipper",
        content: `🎬 ${clip.broadcaster_name}`,
        embeds: [
            {
                title: clip.title,
                url: clip.url,
                color: 0x9146ff,
                image: clip.thumbnail_url
                    ? { url: clip.thumbnail_url }
                    : undefined,
            },
        ],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Abrir Clip",
                        url: clip.url,
                    },
                ],
            },
        ],
    });
}
