import { Router } from "express";
import { updateTemplate } from "../controllers/admin.controller";
import { validate } from "../middlewares/validate";
import { updateTemplateSchema } from "../schemas/admin.schema";
import { createPostSchema } from "../schemas/post.schema";
import { createPost } from "../controllers/post.controller";

const router = Router();

router.post("/posts", validate(createPostSchema), createPost);
router.put(
	"/templates/:templateType",
	validate(updateTemplateSchema),
	updateTemplate
);

export default router;
