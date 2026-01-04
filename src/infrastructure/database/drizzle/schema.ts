import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

import { user } from "./auth-schema";

export * from "./auth-schema";

export const roomTable = sqliteTable("room", {
	id: text().primaryKey(),
	status: text(),
});

export const newUsersToRoomsTable = sqliteTable("usersToRooms", {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	roomId: text("room_id")
		.notNull()
		.references(() => roomTable.id),
});
