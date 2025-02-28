import type { Database } from "@tursodatabase/api";
import fs from "node:fs/promises";
import { EventSchema } from "./schemas.js";

export const filterByName = (dbName: string) => (database: Database) => {
	return database.name === dbName;
};

export const getEventInformation = async () => {
	const fileContent = await fs.readFile(
		process.env.GITHUB_EVENT_PATH!,
		"utf-8",
	);

	return EventSchema.safeParse(JSON.parse(fileContent));
};
