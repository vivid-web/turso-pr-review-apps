import { z } from "zod";

export const EventSchema = z.object({
	action: z.union([
		z.literal("closed"),
		z.literal("opened"),
		z.literal("reopened"),
		z.string(),
	]),
});
