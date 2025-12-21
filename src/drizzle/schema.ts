import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const roomTable = sqliteTable("room", {
	id: text().primaryKey(),
	status: text(),
});
