import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import fsAsync from "fs/promises";
import prisma from "../config/db";
import { BuildService } from "../services/build.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

const buildService = new BuildService();

export class PageController {
	static serveSite = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const userCount = await prisma.user.count();

			if (userCount === 0) {
				const notInstalledPath = path.join(
					process.cwd(),
					"defaults",
					"not-installed.html"
				);

				let htmlContent = await fsAsync.readFile(notInstalledPath, "utf-8");

				const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

				htmlContent = htmlContent.replace(
					"{{ setupUrl }}",
					`${frontendUrl}/setup`
				);

				return res.send(htmlContent);
			}

			const { slug } = req.params;

			const fileName = !slug ? "index.html" : `${slug}.html`;
			const filePath = path.join(process.cwd(), "dist", fileName);

			if (fs.existsSync(filePath)) {
				return res.sendFile(filePath);
			}

			console.log(`Cache Miss: ${fileName} (Generating...)`);

			const settings = await prisma.settings.findFirst();

			const globalData = {
				siteName: settings?.siteTitle || "My Blog",
				siteDescription: settings?.siteDescription,
				footerText: settings?.footerText,
			};

			let html = "";

			if (!slug) {
				const template = await prisma.template.findUnique({
					where: { type: "index" },
				});

				if (!template)
					return next(new AppError("Homepage template missing in DB", 500));

				const posts = await prisma.post.findMany({
					where: { published: true },
					orderBy: { createdAt: "desc" },
				});

				html = await buildService.generatePage("/", template.content, {
					...globalData,
					posts,
				});
			} else {
				console.log(slug);
				const post = await prisma.post.findUnique({ where: { slug } });

				if (!post) return next(new AppError("Page not found", 404));

				const template = await prisma.template.findUnique({
					where: { type: "post" },
				});

				if (!template)
					return next(new AppError("Post template missing in DB", 500));

				html = await buildService.generatePage(slug, template.content, {
					...globalData,
					post,
				});
			}

			return res.sendFile(filePath);
		}
	);
}
