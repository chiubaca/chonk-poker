import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth-schema";

export * from "./auth-schema";

export const roomTable = sqliteTable("room", {
	id: text().primaryKey(),
	status: text(),
});

export const newUsersToRooms = sqliteTable("usersToRooms", {
	id: text().primaryKey().notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	roomId: text("room_id")
		.notNull()
		.references(() => roomTable.id),
});
