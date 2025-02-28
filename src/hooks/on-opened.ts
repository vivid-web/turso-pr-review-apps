import * as core from "@actions/core";
import type { TursoClient } from "../types.js";
import { filterByName } from "../utils.js";

export const onOpened = async (tursoClient: TursoClient) => {
	const dbName = core.getInput("db_name", { required: true });
	const dbGroupInput = core.getInput("db_group", { required: false });

	const group = dbGroupInput ? dbGroupInput : "default";

	core.info(`Creating database ${dbName} in group ${group}`);

	// Remove the database before creating a new one with the same name
	core.debug("Listing all databases");
	const allDatabases = await tursoClient.databases.list({ group });

	if (allDatabases.some(filterByName(dbName))) {
		core.debug("Database already exists, deleting it");
		await tursoClient.databases.delete(dbName);
	} else {
		core.debug("Database does not exist. Nothing to delete");
	}

	core.debug("Creating new database");
	const database = await tursoClient.databases.create(dbName, { group });

	core.debug("Creating token for the database");
	const dbToken = await tursoClient.databases.createToken(dbName, {
		authorization: "full-access",
	});

	core.setOutput("hostname", database.hostname);
	core.setOutput("token", dbToken.jwt);
	core.setSecret(dbToken.jwt);

	core.info(`Database ${dbName} created with hostname ${database.hostname}`);
};
