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

const clearIndexCache = async () => {
	const indexPath = path.join(process.cwd(), "dist", "index.html");
	await fs.unlink(indexPath).catch(() => null);

	console.log("Index cache cleared.");
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

	await clearIndexCache();

	res.status(201).json({ status: "success", data: post });
});

export const updatePost = catchAsync(async (req, res, next) => {
	const { postId } = req.params;

	const post = await prisma.post
		.update({
			where: { id: postId },
			data: req.body,
		})
		.catch(() => null);

	if (!post) return next(new AppError("Post not found", 404));

	const filePath = path.join(process.cwd(), "dist", `${post.slug}.html`);
	await fs.unlink(filePath).catch(() => null);

	await clearIndexCache();

	console.log(`Post cache cleaned: ${post.slug}`);

	res.status(200).json({ status: "success", data: post });
});

export const getPosts = catchAsync(async (req, res, next) => {
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const search = (req.query.search as string) || "";

	const skip = (page - 1) * limit;

	const whereClause = {
		OR: [{ title: { contains: search, mode: "insensitive" as const } }],
	};

	const [totalPosts, posts] = await prisma.$transaction([
		prisma.post.count({ where: whereClause }),
		prisma.post.findMany({
			where: whereClause,
			skip: skip,
			take: limit,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				title: true,
				slug: true,
				published: true,
				createdAt: true,
			},
		}),
	]);

	const totalPages = Math.ceil(totalPosts / limit);

	res.status(200).json({
		status: "success",
		results: posts.length,
		data: {
			posts,
			pagination: {
				page,
				limit,
				totalPages,
				totalPosts,
			},
		},
	});
});

export const getPostById = catchAsync(async (req, res, next) => {
	const { postId } = req.params;
	const post = await prisma.post.findUnique({ where: { id: postId } });

	if (!post) return next(new AppError("Post not found", 404));

	res.status(200).json({
		status: "success",
		data: post,
	});
});

export const deletePost = catchAsync(async (req, res, next) => {
	const { postId } = req.params;

	const post = await prisma.post.findUnique({ where: { id: postId } });

	if (!post) {
		return next(new AppError("Post not found", 404));
	}

	await prisma.post.delete({ where: { id: postId } });

	const filePath = path.join(process.cwd(), "dist", `${post.slug}.html`);
	await fs
		.unlink(filePath)
		.catch(() => console.log("There is no file to delete"));

	await clearIndexCache();

	res.status(204).json({
		status: "success",
		data: null,
	});
});
