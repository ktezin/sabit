import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

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

export const getFiles = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const limit = Number(req.query.limit) || 0;
		const sortOrder = req.query.sort === "asc" ? "asc" : "desc";

		const fileNames = await fsPromises.readdir(uploadDir);

		const filesWithStats = await Promise.all(
			fileNames.map(async (fileName) => {
				const filePath = path.join(uploadDir, fileName);
				const stats = await fsPromises.stat(filePath);

				return {
					name: fileName,
					url: "/uploads/" + fileName,
					time: stats.mtime.getTime(),
				};
			})
		);

		if (sortOrder === "asc") {
			filesWithStats.sort((a, b) => a.time - b.time);
		} else {
			filesWithStats.sort((a, b) => b.time - a.time);
		}

		const resultFiles =
			limit > 0 ? filesWithStats.slice(0, limit) : filesWithStats;

		res.status(200).json({
			status: "success",
			data: {
				results: resultFiles.length,
				total: filesWithStats.length,
				files: resultFiles,
			},
		});
	}
);

export const deleteFile = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const filename = path.basename(req.params.filename);
		const fileLoc = path.join(uploadDir, filename);

		if (!fs.existsSync(fileLoc)) {
			return next(new AppError("File not found: " + filename, 404));
		}

		try {
			await fsPromises.unlink(fileLoc);
		} catch (error) {
			return next(new AppError("Could not delete file", 500));
		}

		res.status(200).json({
			status: "success",
			message: "File deleted successfully",
		});
	}
);
