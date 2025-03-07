import * as core from "@actions/core";
import { createClient } from "@tursodatabase/api";

import { onClosed } from "./hooks/on-closed.js";
import { onOpened } from "./hooks/on-opened.js";
import { getEventInformation } from "./utils.js";

async function run() {
	const response = await getEventInformation();

	const org = core.getInput("organization", { required: true });
	const token = core.getInput("api_token", { required: true });
	const tursoClient = createClient({ org, token });

	if (!response.success) {
		core.warning("No pull request number found. Skipping Turso GitHub Action");

		return;
	}

	const { action } = response.data;

	if (action === "closed") {
		core.debug(`Handling ${action} action`);
		await onClosed(tursoClient);

		return;
	}

	if (
		action === "opened" ||
		action === "reopened" ||
		action === "synchronize"
	) {
		core.debug(`Handling ${action} action`);
		await onOpened(tursoClient);

		return;
	}

	core.warning(
		`Unsupported pull request ${action} action . Skipping Turso GitHub Action`,
	);
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
