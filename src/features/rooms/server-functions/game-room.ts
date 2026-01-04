import z from "zod";

import { createServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { pokerEventsSchema } from "@/features/poker/state-machine/planning-poker-machine.schemas";

export const handleGameActionServerFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			pokerEvent: pokerEventsSchema,
			roomId: z.string(),
		}),
	)
	.handler(async ({ data }) => {
		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(data.roomId);
		await stub.gameAction(data.pokerEvent);
	});
