/**
 * Discord webhook URL validation utilities
 */

/**
 * Set of hostnames that host Discord webhook endpoints.
 * Includes PTB and Canary environments as well as legacy domains.
 */
const DISCORD_WEBHOOK_HOSTS = new Set([
    "discord.com",
    "discordapp.com",
    "ptb.discord.com",
    "ptb.discordapp.com",
    "canary.discord.com",
    "canary.discordapp.com",
]);

const DISCORD_WEBHOOK_PATH_PREFIX = "/api/webhooks/";

/**
 * Validates whether a URL points to a Discord webhook endpoint.
 *
 * Checks both the hostname (across production, PTB, Canary, and legacy domains)
 * and that the pathname begins with `/api/webhooks/`.
 *
 * @param url - The webhook URL string to validate.
 * @returns `true` if the URL is a valid Discord webhook URL.
 */
export function isValidDiscordWebhookUrl(url: string): boolean {
    try {
        const webhookUrlObj = new URL(url);
        return (
            DISCORD_WEBHOOK_HOSTS.has(webhookUrlObj.hostname) &&
            webhookUrlObj.pathname.startsWith(DISCORD_WEBHOOK_PATH_PREFIX)
        );
    } catch {
        return false;
    }
}
