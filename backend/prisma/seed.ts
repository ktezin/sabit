import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Database seeding");

	const hashedPassword = await bcrypt.hash("123456", 12);

	// 1. Kullanıcı Oluştur
	await prisma.user.upsert({
		where: { email: "admin@sabit.com" },
		update: { password: hashedPassword },
		create: {
			email: "admin@sabit.com",
			password: hashedPassword,
		},
	});

	// 2. Add site info
	await prisma.settings.upsert({
		where: { id: "global" },
		update: {},
		create: { siteName: "Kağan'ın Tekno Bloğu" },
	});

	// 3. Index Template
	await prisma.template.create({
		data: {
			name: "Homepage",
			type: "index",
			content: `<h1>{{ siteName }}</h1> <ul> {% for post in posts %} <li><a href="/{{ post.slug }}">{{ post.title }}</a></li> {% endfor %} </ul>`,
		},
	});

	// 4. Post Template
	await prisma.template.create({
		data: {
			name: "Post Detail",
			type: "post",
			content: `<h1>{{ post.title }}</h1> <div>{{ post.content }}</div> <a href="/">Geri Don</a>`,
		},
	});

	console.log("Default site seeded!");
}

main()
	.catch((e) => console.error(e))
	.finally(async () => await prisma.$disconnect());
