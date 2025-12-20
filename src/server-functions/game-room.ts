import z from "zod";

import { createServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { pokerEventsSchema } from "@/state-machine/planning-poker-machine.schemas";

export const handleGameActionServerFn = createServerFn()
	.inputValidator(
		z.object({
			pokerEvent: pokerEventsSchema,
			roomId: z.string(),
		}),
	)
	.handler(async ({ context, data }) => {
		const { pokerEvent, roomId } = data;
		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(roomId);
		await stub.gameAction({ player: pokerEvent.player, type: pokerEvent.type });
	});
