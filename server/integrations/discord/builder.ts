import type {
    APIEmbed,
    APIMessageTopLevelComponent,
    RESTPostAPIWebhookWithTokenJSONBody,
} from "discord-api-types/v10";

export function createDiscordPayload() {
    const payload: RESTPostAPIWebhookWithTokenJSONBody = {
        username: "Clipper",
        embeds: [],
        components: [],
    };

    return {
        setContent(content: string) {
            payload.content = content;
            return this;
        },

        setUsername(username: string) {
            payload.username = username;
            return this;
        },

        addEmbed(embed: APIEmbed) {
            (payload.embeds ??= []).push(embed);
            return this;
        },

        addComponent(component: APIMessageTopLevelComponent) {
            (payload.components ??= []).push(component);
            return this;
        },

        build() {
            return payload;
        },
    };
}
