import { Liquid } from "liquidjs";
import fs from "fs/promises";
import path from "path";

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
}
