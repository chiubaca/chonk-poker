import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { env } from "cloudflare:workers";

import { getDb } from "@/infrastructure/database/database";
import {
	newUsersToRoomsTable,
	roomTable,
} from "@/infrastructure/database/drizzle/schema";

import type { CreateRoomRequest, JoinRoomRequest } from "../types/room.types";

export const createRoomServerFn = createServerFn({ method: "POST" })
	.inputValidator((data: CreateRoomRequest) => data)
	.handler(async ({ data }) => {
		const { userId, userName } = data;
		const user = { id: userId, name: userName };

		const newRoomId = nanoid(5).toUpperCase();
		const db = getDb();

		await db
			.insert(roomTable)
			.values({
				id: newRoomId,
				status: "live",
			})
			.onConflictDoUpdate({
				target: roomTable.id,
				set: {
					id: newRoomId,
					status: "live",
				},
			});
		await db.insert(newUsersToRoomsTable).values({ roomId: newRoomId, userId });

		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(newRoomId);
		await stub.createRoom(user);

		return { roomId: newRoomId };
	});

export const useCreateRoom = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: createRoomServerFn,
		onSuccess: (data) => {
			router.navigate({
				to: "/room/$roomId",
				params: { roomId: data.roomId },
			});
		},
	});
};

export const joinRoomServerFn = createServerFn({ method: "POST" })
	.inputValidator((data: JoinRoomRequest) => data)
	.handler(async ({ data }) => {
		const { userId, userName, roomId } = data;
		const user = { id: userId, name: userName };

		const db = getDb();

		// Check if user is already in the room
		const existingRecord = await db
			.select()
			.from(newUsersToRoomsTable)
			.where(
				and(
					eq(newUsersToRoomsTable.roomId, roomId),
					eq(newUsersToRoomsTable.userId, userId),
				),
			)
			.limit(1);

		// Only insert if no existing record
		if (existingRecord.length === 0) {
			await db.insert(newUsersToRoomsTable).values({ roomId, userId });
		}

		const stub = env.POKER_ROOM_DURABLE_OBJECT.getByName(roomId);
		await stub.gameAction({
			player: { ...user, state: "choosing" },
			type: "player.join",
		});

		return { roomId };
	});

export const useJoinRoom = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: joinRoomServerFn,
		onSuccess: (data) => {
			router.navigate({
				to: "/room/$roomId",
				params: { roomId: data.roomId },
			});
		},
	});
};
