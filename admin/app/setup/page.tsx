"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";

export default function SetupPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [statusChecked, setStatusChecked] = useState(false);

	const [formData, setFormData] = useState({
		siteTitle: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	useEffect(() => {
		const checkStatus = async () => {
			try {
				const res = await fetch(`${API_URL}/api/setup/status`);
				const data = await res.json();

				if (data.isSetup) {
					router.push("/login");
				} else {
					setStatusChecked(true);
				}
			} catch (error) {
				toast.error("Could not connect to the server.");
			}
		};
		checkStatus();
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`${API_URL}/api/setup/run`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					siteTitle: formData.siteTitle,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				toast.success("Setup completed! Redirecting to login...");
				setTimeout(() => {
					setLoading(false);
					router.push("/login");
				}, 500);
			} else {
				toast.error(data.message || "Setup failed.");
			}
		} catch (error) {
			toast.error("An error occurred.");
			setLoading(false);
		}
	};

	if (!statusChecked)
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-4">
				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
						<Rocket size={32} />
					</div>
					<h1 className="text-3xl font-bold tracking-tight">SabitCMS Setup</h1>
					<p className="text-muted-foreground">
						Get your blog up and running in seconds.
					</p>
				</div>

				<Card className="border-t-4 border-t-blue-600 shadow-lg">
					<form onSubmit={handleSubmit}>
						<CardHeader className="mb-4">
							<CardTitle>Admin Account</CardTitle>
							<CardDescription>
								Create your administrator credentials.
							</CardDescription>
						</CardHeader>
						<CardContent className="my-2 flex flex-col gap-4">
							<div className="space-y-2">
								<Label htmlFor="siteTitle">Site Title</Label>
								<Input
									id="siteTitle"
									placeholder="e.g. My Tech Blog"
									required
									value={formData.siteTitle}
									onChange={(e) =>
										setFormData({ ...formData, siteTitle: e.target.value })
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email Address</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@example.com"
									required
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										required
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="confirmPassword">Confirm Password</Label>
									<Input
										id="confirmPassword"
										type="password"
										required
										value={formData.confirmPassword}
										onChange={(e) =>
											setFormData({
												...formData,
												confirmPassword: e.target.value,
											})
										}
									/>
								</div>
							</div>
						</CardContent>
						<CardFooter className="mt-4">
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700"
								disabled={loading}
							>
								{loading ? "Setting up..." : "Complete Setup"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			</div>
		</div>
	);
}
