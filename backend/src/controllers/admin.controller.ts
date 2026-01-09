import { NextFunction, Request, Response } from "express";
import path from "path";
import fsPromises from "fs/promises";
import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import { BuildService } from "../services/build.service";

const buildService = new BuildService();

export const getTemplates = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const templates = await prisma.template.findMany();

		res.status(200).json({
			status: "success",
			data: { templates },
		});
	}
);

export const updateTemplate = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { templateType } = req.params;
		const { content } = req.body;

		const updateResult = await prisma.template.update({
			where: { type: templateType },
			data: { content: content },
		});

		if (!updateResult) {
			return next(new AppError("Template not found.", 404));
		}

		if (templateType === "index") {
			const filePath = path.join(process.cwd(), "dist", "index.html");
			await fsPromises
				.unlink(filePath)
				.catch(() => console.log("Cache file not found, skipping delete."));
		}

		res.status(200).json({
			status: "success",
			message: "Template updated and cache cleared.",
			data: updateResult,
		});
	}
);

export const triggerBuild = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await buildService.buildAll();

		res.status(200).json({
			status: "success",
			message: "Site build completed successfully.",
			data: result,
		});
	}
);

export const getSettings = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const settings = await prisma.settings.findFirst();

		res.status(200).json({
			status: "success",
			data: settings || {},
		});
	}
);

export const updateSettings = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { siteTitle, siteDescription, footerText, activeTheme } = req.body;

		const settings = await prisma.settings.upsert({
			where: { id: 1 },
			update: {
				siteTitle,
				siteDescription,
				footerText,
				activeTheme,
			},
			create: {
				siteTitle,
				siteDescription,
				footerText,
				activeTheme,
			},
		});

		res.status(200).json({
			status: "success",
			data: settings,
		});
	}
);

export const getDashboardStats = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const [totalPosts, publishedPosts, draftPosts, recentPosts] =
			await prisma.$transaction([
				prisma.post.count(),
				prisma.post.count({ where: { published: true } }),
				prisma.post.count({ where: { published: false } }),
				prisma.post.findMany({
					take: 5,
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						title: true,
						slug: true,
						published: true,
						updatedAt: true,
					},
				}),
			]);

		res.status(200).json({
			status: "success",
			data: {
				counts: {
					total: totalPosts,
					published: publishedPosts,
					draft: draftPosts,
				},
				recentPosts,
			},
		});
	}
);
