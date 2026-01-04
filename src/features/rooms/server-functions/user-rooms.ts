import { eq } from "drizzle-orm";

import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/infrastructure/database/database";
import {
	newUsersToRoomsTable,
	roomTable,
} from "@/infrastructure/database/drizzle/schema";

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
