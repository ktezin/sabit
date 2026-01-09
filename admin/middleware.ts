import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_URL } from "./lib/utils";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	if (
		path.startsWith("/api") ||
		path.startsWith("/_next") ||
		path.startsWith("/assets") ||
		path.includes(".")
	) {
		return NextResponse.next();
	}

	// Setup

	try {
		const res = await fetch(`${API_URL}/api/setup/status`, {
			cache: "no-store",
		});

		if (!res.ok) {
			if (path !== "/setup") {
				return NextResponse.redirect(new URL("/setup", request.url));
			}
			return NextResponse.next();
		}

		const data = await res.json();
		const isSetup = data.isSetup;

		if (!isSetup) {
			if (path !== "/setup") {
				return NextResponse.redirect(new URL("/setup", request.url));
			}
		}

		if (isSetup) {
			if (path === "/setup") {
				return NextResponse.redirect(new URL("/login", request.url));
			}
		}
	} catch (error) {
		console.error("Middleware error (Backend might be down):", error);
		if (path !== "/setup") {
			return NextResponse.redirect(new URL("/setup", request.url));
		}
	}

	// Auth
	const token = request.cookies.get("token")?.value;

	if (path.startsWith("/dashboard") && !token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (path === "/login" && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	if (path === "/") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/:path*",
};
