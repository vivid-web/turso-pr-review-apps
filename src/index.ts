import * as core from "@actions/core";
import { createClient, type TursoClientError } from "@tursodatabase/api";

async function run() {
	const org = core.getInput("organization");
	const token = core.getInput("api_token");
	const dbName = core.getInput("db_name");
	const dbGroup = core.getInput("db_group") || "default";

	const turso = createClient({ org, token });

	// Remove the database before creating a new one with the same name
	await turso.databases.delete(dbName).catch((error: TursoClientError) => {
		if (error.status === 404) {
			return;
		}

		throw error;
	});

	const database = await turso.databases.create(dbName, { group: dbGroup });

	const dbToken = await turso.databases.createToken(dbName, {
		authorization: "full-access",
	});

	core.setOutput("hostname", database.hostname);
	core.setOutput("token", dbToken.jwt);
	core.setSecret(dbToken.jwt);
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
