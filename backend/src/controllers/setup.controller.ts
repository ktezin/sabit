import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs/promises";
import prisma from "../config/db";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getSetupStatus = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userCount = await prisma.user.count();
		res.status(200).json({
			status: "success",
			isSetup: userCount > 0,
		});
	}
);

export const runSetup = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { siteTitle, email, password } = req.body;

		const userCount = await prisma.user.count();
		if (userCount > 0) {
			return next(new AppError("System is already set up.", 403));
		}

		const defaultsPath = path.join(process.cwd(), "defaults");

		let indexTemplateContent = "";
		let postTemplateContent = "";

		try {
			indexTemplateContent = await fs.readFile(
				path.join(defaultsPath, "index.html"),
				"utf-8"
			);
			postTemplateContent = await fs.readFile(
				path.join(defaultsPath, "post.html"),
				"utf-8"
			);
		} catch (error) {
			return next(new AppError("Could not read default template files.", 500));
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
			},
		});

		await prisma.settings.create({
			data: {
				siteTitle: siteTitle || "My New Blog",
				siteDescription: "Just another static blog site.",
				footerText: "Powered by SabitCMS",
				activeTheme: "default",
			},
		});

		await prisma.template.createMany({
			data: [
				{
					name: "Homepage",
					type: "index",
					content: indexTemplateContent,
				},
				{
					name: "Post Detail",
					type: "post",
					content: postTemplateContent,
				},
			],
		});

		await prisma.post.create({
			data: {
				title: "Hello World!",
				slug: "hello-world",
				content:
					"<p>Welcome to your new blog. This is your first post. You can edit or delete it from the dashboard.</p>",
				published: true,
			},
		});

		res.status(201).json({
			status: "success",
			message: "Setup completed successfully!",
			user: { id: user.id, email: user.email },
		});
	}
);
