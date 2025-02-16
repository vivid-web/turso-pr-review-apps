import * as core from "@actions/core";
import { createClient, type Database } from "@tursodatabase/api";

const filterByName = (dbName: string) => (database: Database) => {
	return database.name === dbName;
};

async function run() {
	const org = core.getInput("organization", { required: true });
	const token = core.getInput("api_token", { required: true });
	const dbName = core.getInput("db_name", { required: true });
	const dbGroupInput = core.getInput("db_group", { required: false });
	const group = dbGroupInput ? dbGroupInput : "default";

	const turso = createClient({ org, token });

	core.info(`Creating database ${dbName} in group ${group}`);

	// Remove the database before creating a new one with the same name
	core.debug("Listing all databases");
	const allDatabases = await turso.databases.list({ group });

	if (allDatabases.some(filterByName(dbName))) {
		core.debug("Database already exists, deleting it");
		await turso.databases.delete(dbName);
	} else {
		core.debug("Database does not exist. Nothing to delete");
	}

	core.debug("Creating new database");
	const database = await turso.databases.create(dbName, { group });

	core.debug("Creating token for the database");
	const dbToken = await turso.databases.createToken(dbName, {
		authorization: "full-access",
	});

	core.setOutput("hostname", database.hostname);
	core.setOutput("token", dbToken.jwt);
	core.setSecret(dbToken.jwt);

	core.info(`Database ${dbName} created with hostname ${database.hostname}`);
}

try {
	await run();
} catch (error) {
	if (error instanceof Error) {
		core.setFailed(error.message);
	} else {
		core.setFailed(`${error}`);
	}
}
