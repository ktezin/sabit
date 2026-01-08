import { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

export const updateTemplate = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { siteId, templateType } = req.params;
		const { content } = req.body;

		const updateResult = await prisma.template.updateMany({
			where: {
				type: templateType,
			},
			data: {
				content: content,
			},
		});

		if (updateResult.count === 0) {
			return next(
				new AppError(
					"No templates matching the specified criteria were found.",
					404
				)
			);
		}

		if (templateType === "index") {
			const sitePath = path.join(process.cwd(), "sites", siteId);
			const filePath = path.join(sitePath, "index.html");

			await fs.unlink(filePath).catch(() => null);
		}

		res.status(200).json({
			status: "success",
			message:
				"The template has been successfully updated and the cache cleared.",
		});
	}
);
