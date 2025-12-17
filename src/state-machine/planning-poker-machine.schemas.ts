import { z } from "zod";

export const optionsSchema = z.enum([
	"a-fine-boi",
	"he-chonk",
	"heckin-chonker",
	"hefty-chonk",
	"mega-chonker",
	"oh-lawd-he-comin",
]);

export const pokerPlayerSchema = z.object({
	id: z.string(),
	name: z.string(),
	choice: optionsSchema.optional(),
	state: z.enum(["choosing", "locked-in"]),
});

export const pokerGameContext = z.object({
	players: z.array(pokerPlayerSchema),
	lockedInPlayers: z.number(),
});

export const pokerEventsSchema = z.discriminatedUnion("type", [
	z.object({ type: z.literal("player.join"), player: pokerPlayerSchema }),
	z.object({ type: z.literal("player.choose"), player: pokerPlayerSchema }),
	z.object({ type: z.literal("player.lock"), player: pokerPlayerSchema }),
	z.object({ type: z.literal("game.reveal"), player: pokerPlayerSchema }),
]);
