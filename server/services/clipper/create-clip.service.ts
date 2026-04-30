import { sendDiscordWebhook } from "#server/integrations/discord/webhook.ts";
import { getTwitchClipById } from "#server/integrations/twitch/api/clips.ts";
import { getTwitchUserById } from "#server/integrations/twitch/api/users.ts";
import {
  MessageFlags,
  type RESTPostAPIWebhookWithTokenJSONBody,
} from "discord-api-types/v10";

export async function handleClipCreated(
  clipId: string,
  webhookUrl: string,
): Promise<void> {
  // Does actually verifies if both values are not empty.
  if (!webhookUrl || !clipId) return;

  const clip = await getTwitchClipById(clipId);
  if (!clip) return;

  const broadcasterUser = await getTwitchUserById(clip.broadcaster_id);
  const timestamp = Math.floor(new Date(clip.created_at).getTime() / 1000);

  const payload: RESTPostAPIWebhookWithTokenJSONBody = {
    username: clip.broadcaster_name,
    avatar_url: broadcasterUser?.profile_image_url,

    content: `> [🎬](${clip.url}) Novo clip no canal!`,

    embeds: [
      {
        title: `🎮 ${clip.broadcaster_name} em destaque`,
        url: clip.url,

        description:
          `✂️ Clipado por **${clip.creator_name}**\n` +
          `🕒 <t:${timestamp}:F> (<t:${timestamp}:R>)`,

        color: 0x9146ff,

        image: clip.thumbnail_url
          ? { url: clip.thumbnail_url + `?t=${Date.now()}` }
          : undefined,

        footer: {
          text: "• Clique para assistir",
        },

        timestamp: clip.created_at,
      },
    ],
  };

  await sendDiscordWebhook(webhookUrl, payload);

  // Send clip URL as separate message for Discord to generate its own embed
  const linkPayload: RESTPostAPIWebhookWithTokenJSONBody = {
    content: clip.url,
    flags: MessageFlags.SuppressNotifications,
  };

  await sendDiscordWebhook(webhookUrl, linkPayload);
}
