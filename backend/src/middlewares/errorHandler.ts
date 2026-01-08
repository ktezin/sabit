import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const globalErrorHandler = (
	err: AppError | Error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let statusCode = (err as AppError).statusCode || 500;
	let message = err.message || "An unexpected error occured in server.";

	if (process.env.NODE_ENV === "development") {
		return res.status(statusCode).json({
			success: false,
			error: err,
			message,
			stack: err.stack,
		});
	}

	return res.status(statusCode).json({
		success: false,
		message,
	});
};
