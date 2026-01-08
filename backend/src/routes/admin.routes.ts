import { Router } from "express";
import { getSettings, getTemplates, triggerBuild, updateSettings, updateTemplate } from "../controllers/admin.controller";
import { validate } from "../middlewares/validate";
import { updateTemplateSchema } from "../schemas/admin.schema";
import { createPostSchema, postQuerySchema, updatePostSchema } from "../schemas/post.schema";
import {
	createPost,
	deletePost,
	getPostById,
	getPosts,
	updatePost,
} from "../controllers/post.controller";

const router = Router();

router.get("/posts", validate(postQuerySchema), getPosts);
router.post("/posts", validate(createPostSchema), createPost);
router.get("/posts/:postId", getPostById);
router.delete("/posts/:postId", deletePost);
router.put("/posts/:postId", validate(updatePostSchema), updatePost);

router.put(
	"/templates/:templateType",
	validate(updateTemplateSchema),
	updateTemplate
);
router.get("/templates", getTemplates);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.post("/build", triggerBuild);

export default router;
