import { z } from "zod";

export const updateTemplateSchema = z.object({
	params: z.object({
		templateType: z.enum(["index", "post", "page"], {
			errorMap: () => ({
				message: "Invalid template type. (Can be index, post, page)",
			}),
		}),
	}),
	body: z.object({
		content: z
			.string()
			.min(10, "Template content must be very short, at least 10 characters."),
	}),
});

export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
