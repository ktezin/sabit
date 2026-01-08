import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import prisma from "../config/db";
import { BuildService } from "../services/build.service";
import { AppError } from "../utils/AppError"; // Assuming you have this
import { catchAsync } from "../utils/catchAsync";

const buildService = new BuildService();

export class PageController {
	static serveSite = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { slug } = req.params;

			const fileName = slug ? `${slug}.html` : "index.html";
			const filePath = path.join(process.cwd(), "dist", fileName);

			// Incremental Static Regeneration
			// Check if file exists on disk
			if (fs.existsSync(filePath)) {
				console.log(`Cache Hit: ${fileName}`);
				return res.sendFile(filePath);
			}

			console.log(`Cache Miss: ${fileName} (Generating...)`);

			const settings = await prisma.settings.findUnique({
				where: { id: "global" },
			});
			const siteName = settings?.siteName || "My Blog";

			let html = "";

			if (!slug) {
				// Homepage
				const template = await prisma.template.findUnique({
					where: { type: "index" },
				});
				if (!template)
					return next(new AppError("Homepage template missing", 500));

				const posts = await prisma.post.findMany({
					where: { published: true },
					orderBy: { createdAt: "desc" },
				});

				html = await buildService.generatePage("/", template.content, {
					siteName,
					posts,
					generatedAt: new Date().toLocaleString(),
				});
			} else {
				// Posts
				const template = await prisma.template.findUnique({
					where: { type: "post" },
				});
				if (!template) return next(new AppError("Post template missing", 500));

				const post = await prisma.post.findUnique({ where: { slug } });
				if (!post) return next(new AppError("Post not found", 404));

				html = await buildService.generatePage(slug, template.content, {
					siteName,
					post,
					generatedAt: new Date().toLocaleString(),
				});
			}

			return res.sendFile(filePath);
		}
	);
}
