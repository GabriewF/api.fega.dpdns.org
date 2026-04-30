import { sendDiscordWebhook } from "#server/integrations/discord/webhook.ts";
import { getTwitchClipById } from "#server/integrations/twitch/api/clips.ts";
import { getTwitchUserById } from "#server/integrations/twitch/api/users.ts";
import { type RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";

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

    content: [
      `> 🎬 **${clip.broadcaster_name}** em destaque`,
      `✂️ Clipado por **${clip.creator_name}**`,
      `🕒 <t:${timestamp}:F> (<t:${timestamp}:R>)`,
      ``,
      `[🎥 Assistir clip](${clip.url})`,
    ].join("\n"),
  };

  await sendDiscordWebhook(webhookUrl, payload);
}
