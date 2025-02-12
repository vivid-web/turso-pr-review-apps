import * as core from "@actions/core";
import { createClient, type TursoClientError } from "@tursodatabase/api";

async function run() {
	const org = core.getInput("organization", { required: true });
	const token = core.getInput("api_token", { required: true });
	const dbName = core.getInput("db_name", { required: true });
	const dbGroupInput = core.getInput("db_group", { required: false });
	const group = dbGroupInput ? dbGroupInput : "default";

	const turso = createClient({ org, token });

	core.info(`Creating database ${dbName} in group ${group}`);

	// Remove the database before creating a new one with the same name
	core.debug("Deleting database if it already exists");

	try {
		await turso.databases.delete(dbName);
		// @ts-expect-error TursoClientError is not exported as an error-type
	} catch (error: TursoClientError) {
		if (error.status === 404) {
			core.debug("Database not found, skipping deletion");

			return;
		}

		if (error.status === 401) {
			core.error("Unauthorized to set up the database");

			throw error;
		}

		core.debug("An error occurred while deleting the database");
		core.debug(`Error status: ${error.status}`);
		core.debug(`Error message: ${error.message}`);

		throw error;
	}

	core.debug("Creating new database");
	const database = await turso.databases.create(dbName, { group });

	core.debug("Creating token for the database");
	const dbToken = await turso.databases.createToken(dbName, {
		authorization: "full-access",
	});

	core.exportVariable("TURSO_DATABASE_URL", database.hostname);
	core.exportVariable("TURSO_AUTH_TOKEN", dbToken.jwt);
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
