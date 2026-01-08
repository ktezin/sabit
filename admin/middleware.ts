import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// 1. Göz ardı edilecek yollar (API, Static dosyalar, Next.js internal dosyaları)
	// Bunları engellersek site çalışmaz veya sonsuz döngüye girer.
	if (
		path.startsWith("/api") ||
		path.startsWith("/_next") ||
		path.startsWith("/assets") || // Public assets
		path.includes(".") // Resimler, favicon vb. uzantılı dosyalar
	) {
		return NextResponse.next();
	}

	try {
		// 2. Backend'den kurulum durumunu sor
		// Middleware sunucu tarafında çalıştığı için tam URL (http://localhost:3000) vermemiz gerekebilir.
		// Canlı ortamda bu URL'i env dosyasından çekmek daha doğrudur.
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
		const res = await fetch(`${apiUrl}/api/setup/status`, {
			cache: "no-store", // Cache yapma, her seferinde güncel durumu kontrol et
		});

		// Eğer backend kapalıysa veya hata varsa devam et (Sistemi kilitlemeyelim)
		if (!res.ok) {
			if (path !== "/setup") {
				return NextResponse.redirect(new URL("/setup", request.url));
			}
			return NextResponse.next();
		}

		const data = await res.json();
		const isSetup = data.isSetup;

		// --- YÖNLENDİRME MANTIĞI ---

		// SENARYO A: Sistem KURULU DEĞİL
		if (!isSetup) {
			// Kullanıcı zaten /setup sayfasında değilse, oraya zorla gönder
			if (path !== "/setup") {
				return NextResponse.redirect(new URL("/setup", request.url));
			}
		}

		// SENARYO B: Sistem ZATEN KURULU
		if (isSetup) {
			// Kullanıcı /setup sayfasına girmeye çalışırsa, login'e at
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

	return NextResponse.next();
}

// Middleware'in hangi yollarda çalışacağını belirtiyoruz
export const config = {
	matcher: "/:path*",
};
