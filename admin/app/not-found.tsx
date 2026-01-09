import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/utils";

export default function NotFound() {
	return (
		<div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-6 p-4 text-center">
			<div className="relative">
				<div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
				<div className="relative bg-muted p-4 rounded-full">
					<FileQuestion className="h-12 w-12 text-primary" />
				</div>
			</div>

			<div className="space-y-2">
				<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
					404
				</h1>
				<h2 className="text-2xl font-semibold tracking-tight">
					Page Not Found
				</h2>
				<p className="text-muted-foreground max-w-125">
					The page you're looking for may have been deleted, renamed, or is
					temporarily unavailable.
				</p>
			</div>

			<div className="flex gap-4">
				<Link href="/dashboard">
					<Button size="lg" className="font-semibold">
						Return to Dashboard
					</Button>
				</Link>
				<Link href={API_URL}>
					<Button variant="outline" size="lg">
						View Site
					</Button>
				</Link>
			</div>
		</div>
	);
}
