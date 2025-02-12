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
	await turso.databases.delete(dbName).catch((error: TursoClientError) => {
		if (error.status === 404) {
			return;
		}

		throw error;
	});

	const database = await turso.databases.create(dbName, { group });

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
