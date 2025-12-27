import { eq } from "drizzle-orm";

import { createServerFn } from "@tanstack/react-start";

import { newUsersToRoomsTable, roomTable } from "@/drizzle/schema";
import { getDb } from "@/lib/database";

export const getUserRoomsServerFn = createServerFn()
	.inputValidator((userId: string) => userId)
	.handler(async ({ data: userId }) => {
		const db = getDb();

		const userRooms = await db
			.select({
				roomId: roomTable.id,
				status: roomTable.status,
			})
			.from(newUsersToRoomsTable)
			.innerJoin(roomTable, eq(newUsersToRoomsTable.roomId, roomTable.id))
			.where(eq(newUsersToRoomsTable.userId, userId));

		return userRooms;
	});
