import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

const signToken = (id: string) => {
	const secret = process.env.JWT_SECRET || "secret-key";

	const signOptions: jwt.SignOptions = {
		expiresIn: process.env.JWT_EXPIRES_IN as any,
	};

	return jwt.sign({ id }, secret, signOptions);
};

export const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(new AppError("Please provide email and password", 400));
		}

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return next(new AppError("Incorrect email or password", 401));
		}

		const token = signToken(user.id);

		const { password: _, ...userWithoutPassword } = user;

		res.status(200).json({
			status: "success",
			token,
			data: {
				user: userWithoutPassword,
			},
		});
	}
);
