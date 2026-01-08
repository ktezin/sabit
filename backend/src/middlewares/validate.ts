import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate =
	(schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = schema.parse({
				body: req.body,
				query: req.query,
				params: req.params,
			});

			req.body = result.body;
			if (result.query) {
				Object.assign(req.query, result.query);
			}

			if (result.params) {
				Object.assign(req.params, result.params);
			}

			next();
		} catch (error) {
			return next(error);
		}
	};
