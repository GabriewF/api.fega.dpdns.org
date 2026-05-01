export function generateApiKey(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(48));
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return `sk_live_${Array.from(bytes)
        .map((b) => chars[b % chars.length])
        .join("")}`;
}
