import { z } from "zod";

export const createPostSchema = z.object({
	body: z.object({
		title: z.string().min(3, "The title must be at least 3 characters long."),
		content: z.string().min(10, "Content is too short."),
		slug: z.string().optional(),
		published: z.boolean().optional(),
	}),
});

export const updatePostSchema = z.object({
	params: z.object({
		postId: z.string().uuid(),
	}),
	body: z.object({
		title: z.string().optional(),
		content: z.string().optional(),
		slug: z.string().optional(),
		published: z.boolean().optional(),
	}),
});

export const postQuerySchema = z.object({
	query: z.object({
		page: z.coerce
			.number()
			.min(1, "The number of pages must be at least 1.")
			.default(1),
		limit: z.coerce
			.number()
			.min(1)
			.max(100, "A maximum of 100 records can be retrieved at a time.")
			.default(10),
		search: z.string().optional().default(""),
	}),
});

export type PostQueryInput = z.infer<typeof postQuerySchema>["query"];
