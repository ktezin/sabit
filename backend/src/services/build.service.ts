import { Liquid } from "liquidjs";
import fs from "fs/promises";
import path from "path";
import prisma from "../config/db";
import { AppError } from "../utils/AppError";

export class BuildService {
	private engine: Liquid;
	private outputDir: string;

	constructor() {
		this.engine = new Liquid();
		this.outputDir = path.join(process.cwd(), "dist");
	}

	async generatePage(slug: string, templateContent: string, data: any) {
		try {
			const tpl = this.engine.parse(templateContent);
			const html = await this.engine.render(tpl, data);

			await fs.mkdir(this.outputDir, { recursive: true });

			const fileName = slug === "/" ? "index.html" : `${slug}.html`;
			const filePath = path.join(this.outputDir, fileName);

			await fs.writeFile(filePath, html, "utf-8");

			console.log(`Page generated: ${filePath}`);
			return html;
		} catch (error) {
			console.error("Page generation error:", error);
			throw error;
		}
	}

	async buildAll() {
		const [settings, indexTemplate, postTemplate, posts] = await Promise.all([
			prisma.settings.findFirst(),
			prisma.template.findUnique({ where: { type: "index" } }),
			prisma.template.findUnique({ where: { type: "post" } }),
			prisma.post.findMany({ where: { published: true } }),
		]);

		// Hata Kontrolü
		if (!indexTemplate)
			throw new AppError("Homepage template not found in DB", 404);
		if (!postTemplate) throw new AppError("Post template not found in DB", 404);

		const globalData = {
			siteName: settings?.siteTitle || "My Blog",
			siteDescription: settings?.siteDescription,
			footerText: settings?.footerText,
		};

		await this.generatePage("/", indexTemplate.content, {
			...globalData,
			posts: posts,
		});

		for (const post of posts) {
			await this.generatePage(post.slug, postTemplate.content, {
				...globalData,
				post: post,
			});
		}

		return { status: "success", pageCount: 1 + posts.length };
	}
}
