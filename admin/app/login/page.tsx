"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const res = await fetch("http://localhost:3000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				// Backend'den mesaj gelmezse varsayılan olarak "Login failed" gösterilecek
				throw new Error(data.message || "Login failed");
			}

			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.data.user));

			router.push("/dashboard");
		} catch (err: any) {
			setError(err.message);
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 px-4">
			<Card className="w-full max-w-sm shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center mb-2">
						<div className="p-3 bg-primary/10 rounded-full">
							<Lock className="w-6 h-6 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
					<CardDescription>Enter your credentials to continue</CardDescription>
				</CardHeader>
				<form onSubmit={handleLogin}>
					<CardContent className="space-y-4">
						{error && (
							<div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md text-center">
								{error}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@sabit.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="mt-4">
						<Button className="w-full" type="submit" disabled={loading}>
							{loading ? "Logging in..." : "Login"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
