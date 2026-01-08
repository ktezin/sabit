import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/AppError";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, uniqueSuffix + ext);
	},
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new AppError("Not an image! Please upload only images.", 400), false);
	}
};

export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadImage = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.file) {
		return next(new AppError("No file uploaded.", 400));
	}

	const fileUrl = `/uploads/${req.file.filename}`;

	res.status(200).json({
		status: "success",
		url: fileUrl,
	});
};
