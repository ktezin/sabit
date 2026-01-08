"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // If not installed: npx shadcn@latest add textarea
import { Switch } from "@/components/ui/switch"; // If not installed: npx shadcn@latest add switch
import { ArrowLeft, Save } from "lucide-react";
import Editor from "@/components/editor";
import { API_URL } from "@/lib/utils";

export default function NewPostPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		content: "",
		published: false,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${API_URL}/api/admin/posts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (!res.ok) throw new Error("Failed to create post");

			router.push("/dashboard/posts");
			router.refresh();
		} catch (error) {
			alert("An error occurred!");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h2 className="text-2xl font-bold tracking-tight">Create New Post</h2>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-6 border p-6 rounded-lg bg-white dark:bg-zinc-900"
			>
				<div className="space-y-2">
					<Label htmlFor="title">Post Title</Label>
					<Input
						id="title"
						placeholder="Ex: Building a Blog with Next.js"
						value={formData.title}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="content">Content</Label>
					<Editor
						value={formData.content}
						onChange={(html) => setFormData({ ...formData, content: html })}
					/>
				</div>

				<div className="flex items-center justify-between border p-4 rounded-md">
					<div className="space-y-0.5">
						<Label className="text-base">Publish</Label>
						<p className="text-sm text-muted-foreground">
							If enabled, the post will be visible on the site immediately.
						</p>
					</div>
					<Switch
						checked={formData.published}
						onCheckedChange={(checked) =>
							setFormData({ ...formData, published: checked })
						}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? (
						<span className="animate-spin mr-2">⏳</span>
					) : (
						<Save className="mr-2 h-4 w-4" />
					)}
					Save and Create
				</Button>
			</form>
		</div>
	);
}
