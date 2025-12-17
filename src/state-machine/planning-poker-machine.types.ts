import type z from "zod";
import type {
	optionsSchema,
	pokerEventsSchema,
	pokerGameContext,
	pokerPlayerSchema,
} from "./planning-poker-machine.schemas";

export type Option = z.infer<typeof optionsSchema>;
export type PokerPlayer = z.infer<typeof pokerPlayerSchema>;
export type PokerGameContext = z.infer<typeof pokerGameContext>;
export type PokerGameEvents = z.infer<typeof pokerEventsSchema>;
