import * as core from "@actions/core";
import type { TursoClient } from "../types.js";
import { filterByName } from "../utils.js";

export const onClosed = async (tursoClient: TursoClient) => {
	const dbName = core.getInput("db_name", { required: true });
	const dbGroupInput = core.getInput("db_group", { required: false });

	const group = dbGroupInput ? dbGroupInput : "default";

	core.info(`Removing database ${dbName} in group ${group}`);

	core.debug("Listing all databases");
	const allDatabases = await tursoClient.databases.list({ group });

	if (allDatabases.some(filterByName(dbName))) {
		core.debug("Database exists, deleting it");
		await tursoClient.databases.delete(dbName);
	} else {
		core.debug("Database does not exist. Nothing to delete");
	}

	core.info(`Database ${dbName} deleted`);
};
