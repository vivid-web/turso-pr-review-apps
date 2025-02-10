import * as core from "@actions/core";
import { createClient } from "@tursodatabase/api";

async function run() {
	const apiToken = core.getInput("api_token");
	const org = core.getInput("organization_name");
	const existingDbName = core.getInput("existing_database_name");
	const newDbName = core.getInput("new_database_name");

	const turso = createClient({ org, token: apiToken });

	const { group } = await turso.databases.get(existingDbName);

	if (!group) {
		throw new Error("Database does not belong to a group");
	}

	const database = await turso.databases.create(newDbName, {
		group,
		seed: {
			type: "database",
			name: existingDbName,
		},
	});

	const token = await turso.databases.createToken(newDbName, {
		authorization: "full-access",
	});

	core.setOutput("hostname", database.hostname);
	core.setOutput("token", token.jwt);
	core.setSecret(token.jwt);
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
