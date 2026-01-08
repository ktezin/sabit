# SabitCMS: Custom Static Site Generator & Headless CMS

**SabitCMS**, is a full-stack content management system that combines the speed and security of **Static Site Generators (SSG)** with the ease of use of a user-friendly **Admin Dashboard**. Unlike traditional CMSs that query the database on every request, SabitCMS builds static HTML files, ensuring lightning-fast performance and SEO optimization.

## Why I Built This?

As a developer, I love the performance of static sites (like Jekyll or Hugo), but managing content via Markdown files and CLI commands isn't user-friendly for non-technical clients. WordPress, on the other hand, is easy to use but can be bloated and slow.

**I wanted to bridge this gap.**

My goal was to build a system where:

1. **Content Managers** get a rich text editor and a dashboard.
2. **Developers** get full control over HTML templates via code.
3. **End Users** get the speed of raw HTML/CSS.

This project taught me how **Static Site Generation engines work under the hood**, how to handle file systems in Node.js, and how to build a complex full-stack architecture.

## Key Features

* **Custom SSG Engine:** Converts database content into static HTML files using **LiquidJS** templating.
* **ISR-like Caching Strategy:** Implements an "Incremental Static Regeneration" logic. When a post is updated, only the specific HTML file is deleted and rebuilt on the next request, rather than rebuilding the entire site.
* **Setup Wizard:** A WordPress-style installation flow. It detects if the system is unconfigured and guides the user to create an admin account and default templates.
* **Advanced Post Editor:**
* **WYSIWYG Editing:** Integrated **TipTap** for a rich text experience.
* **Image Management:** Drag & drop image uploading, resizing, and alignment.


* **Built-in Code Editor:** Integrated **Monaco Editor (VS Code engine)** directly into the dashboard for editing HTML templates live in the browser.
* **Dynamic Templates:** The system supports dynamic LiquidJS templates stored in the database, allowing layout changes without redeploying the code.
* **Media Library:** Custom upload system using `Multer` with auto-sync to the build folder.

## Tech Stack

### Backend (The Engine)

* **Node.js & Express:** Core server and API handling.
* **Prisma ORM:** Database management (SQLite/PostgreSQL).
* **LiquidJS:** Template engine for compiling HTML.
* **Multer & FS-Extra:** File system operations and media handling.
* **Bcrypt & JWT:** Secure authentication and authorization.

### Frontend (The Dashboard)

* **Next.js 14 (App Router):** The React framework for the admin panel.
* **TypeScript:** Type safety across the entire application.
* **Tailwind CSS & Shadcn UI:** Modern and responsive UI components.
* **TipTap:** Headless rich text editor framework.
* **Monaco Editor:** Code editor for template management.
* **Zod:** Schema validation for API requests.

## Architecture & Workflow

1. **Content Creation:** The user writes a post in the Next.js Admin Panel. Images are uploaded to the backend via API.
2. **Data Storage:** Content is stored in the database (PostgreSQL/SQLite) via Prisma.
3. **The Request (Public Side):** When a visitor requests a page (e.g., `/hello-world`):
* The backend checks if `dist/hello-world.html` exists.
* **Cache Hit:** If yes, it serves the static file immediately (0ms DB latency).
* **Cache Miss:** If no, the **Build Service** fetches data from DB, compiles the Liquid template, generates the HTML, saves it to disk, and serves it.


4. **Invalidation:** When a post is updated in the Admin Panel, the specific static file is deleted to force a re-build on the next visit.

## Getting Started

### Prerequisites

* Node.js (v18+)
* npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ktezin/sabit.git
cd sabit
```

2. **Setup Backend**
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

3. **Setup Frontend**
```bash
cd admin
npm install
npm run dev
```

4. **Run the Wizard**
Go to `http://localhost:3000` (Backend) or `http://localhost:3001` (Frontend). You will be automatically redirected to the **Setup Page** to create your admin account.

## What I Learned

Building SabitCMS was a deep dive into full-stack development. Key takeaways included:

* **System Design:** Designing a system that separates the "Admin" (Dynamic) from the "Public Site" (Static).
* **File System Manipulation:** Learning to safely read, write, and delete files programmatically in Node.js to mimic SSG behavior.
* **Middleware Patterns:** implementing robust middleware in Next.js for route protection and installation checks.
* **Rich Text Complexity:** Handling image uploads within a text editor and rendering them correctly was a significant challenge solved by customizing TipTap extensions.
