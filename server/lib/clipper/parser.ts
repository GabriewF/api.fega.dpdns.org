import { parseArgs, type ArgsDef } from "citty";
import * as v from "valibot";

const ClipCommandSchema = v.object({
    duration: v.optional(
        v.pipe(
            v.number("Duração deve ser um número"),
            v.integer("Duração deve ser um número inteiro"),
            v.minValue(5, "Duração mínima é de 5 segundos"),
            v.maxValue(60, "Duração máxima é de 60 segundos")
        )
    ),
    title: v.optional(
        v.pipe(
            v.string("Título deve ser um texto"),
            v.minLength(1, "Título não pode ser vazio")
        )
    ),
});

export type ClipCommand = v.InferOutput<typeof ClipCommandSchema>;

const clipArgs = {
    duration: { type: "string", alias: "d" },
    title: { type: "string", alias: "t" },
} satisfies ArgsDef;

function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string"
        && value.trim().length > 0;
}

function parseFlagDuration(value: unknown): number | undefined {
    if (typeof value === "string" && value.length > 0) {
        return Number(value);
    }

    return undefined;
}

function parseFlagTitle(value: unknown): string | undefined {
    if (isNonEmptyString(value)) {
        return value.trim();
    }

    return undefined;
}

export function parseClipCommand(input: string): ClipCommand {
    const query = input.trim();
    if (!query) return {};

    const rawArgs = query.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
    const parsed = parseArgs(rawArgs, clipArgs);

    const positional = parsed._.map((arg) => arg.replace(/^['"]|['"]$/g, ""));

    let posDuration: number | undefined;
    if (positional[0]?.match(/^(\d+)(s|sec)$/i)) {
        const rawDuration = positional.shift();
        if (rawDuration) {
            posDuration = Number(rawDuration.replace(/(s|sec)$/i, ""));
        }
    }

    let posTitle: string | undefined;
    const joinedTitle = positional.join(" ").trim();
    if (isNonEmptyString(joinedTitle)) {
        posTitle = joinedTitle;
    }

    const flagDuration = parseFlagDuration(parsed.duration);
    const flagTitle = parseFlagTitle(parsed.title);

    if (posDuration !== undefined && flagDuration !== undefined) {
        throw new Error("Duração informada mais de uma vez.");
    }
    if (posTitle !== undefined && flagTitle !== undefined) {
        throw new Error("Título informado mais de uma vez.");
    }

    return v.parse(ClipCommandSchema, {
        duration: posDuration ?? flagDuration,
        title: posTitle ?? flagTitle,
    });
}
