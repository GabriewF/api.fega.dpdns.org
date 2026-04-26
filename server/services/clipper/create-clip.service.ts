import { sendDiscordWebhook } from "#server/integrations/discord/webhook";
import { getTwitchClipById } from "#server/integrations/twitch/api/clips";

export async function handleClipCreated(
    clipUrl: string,
    webhookUrl?: string
) {
    if (!webhookUrl) return;

    let clipId: string | null = null;

    const shortMatch = clipUrl.match(/clips\.twitch\.tv\/([^/?]+)/);

    if (shortMatch) {
        clipId = shortMatch[1];
    }

    const longMatch = clipUrl.match(/twitch\.tv\/[^/]+\/clip\/([^/?]+)/);

    if (longMatch) {
        clipId = longMatch[1];
    }

    if (!clipId) return;

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
