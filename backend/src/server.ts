import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import prisma from "./config/db";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
	console.log(`Server running on port ${PORT}`);
	console.log(
		`Frontend expected at: ${
			process.env.FRONTEND_URL || "http://localhost:3001"
		}`
	);

	try {
		await prisma.$connect();
		console.log("Database connected successfully");
	} catch (error) {
		console.error("Database connection failed", error);
	}
});
process.on("SIGINT", async () => {
	console.log("Shutting down server...");
	await prisma.$disconnect();
	server.close(() => {
		console.log("Server closed.");
		process.exit(0);
	});
});
