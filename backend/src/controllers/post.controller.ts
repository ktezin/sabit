import prisma from "../config/db";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import path from "path";
import fs from "fs/promises";

const slugify = (text: string) => {
	return text
		.toLowerCase()
		.replace(/ğ/g, "g")
		.replace(/ü/g, "u")
		.replace(/ş/g, "s")
		.replace(/ı/g, "i")
		.replace(/ö/g, "o")
		.replace(/ç/g, "c")
		.replace(/[^a-z0-9-]/g, "-")
		.replace(/-+/g, "-");
};

export const createPost = catchAsync(async (req, res, next) => {
	const { title, content, published } = req.body;

	let slug = req.body.slug || slugify(title);

	const existing = await prisma.post.findFirst({ where: { slug } });
	if (existing) {
		slug = `${slug}-${Date.now()}`;
	}

	const post = await prisma.post.create({
		data: {
			title,
			content,
			slug,
			published: published || false,
		},
	});

	res.status(201).json({ status: "success", data: post });
});

export const updatePost = catchAsync(async (req, res, next) => {
	const { siteId, postId } = req.params;

	const post = await prisma.post
		.update({
			where: { id: postId },
			data: req.body,
		})
		.catch(() => null);

	if (!post) return next(new AppError("Post not found", 404));

	const filePath = path.join(
		process.cwd(),
		"sites",
		siteId,
		`${post.slug}.html`
	);
	await fs.unlink(filePath).catch(() => null);

	console.log(`Post cache cleaned: ${post.slug}`);

	res.status(200).json({ status: "success", data: post });
});
