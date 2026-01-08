import express from "express";
import cors from "cors";
import morgan from "morgan";

import { AppError } from "./utils/AppError";
import { PageController } from "./controllers/page.controller";
import { globalErrorHandler } from "./middlewares/errorHandler";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import setupRoutes from "./routes/setup.routes";
import { protect } from "./middlewares/auth.middleware";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.use("/api/setup", setupRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/admin", protect, adminRoutes);

app.get("/:slug", PageController.serveSite);
app.get("/", PageController.serveSite);

app.all("/{*any}", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
