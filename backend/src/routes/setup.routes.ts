import express from "express";
import * as setupController from "../controllers/setup.controller";

const router = express.Router();

router.get("/status", setupController.getSetupStatus);
router.post("/run", setupController.runSetup);

export default router;
