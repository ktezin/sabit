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
