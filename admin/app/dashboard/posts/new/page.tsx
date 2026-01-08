"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";
import Editor from "@/components/editor";

export default function NewPostPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		content: "",
		published: false,
	});

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const token = localStorage.getItem("token");

		try {
			const res = await fetch(`${API_URL}/api/admin/posts`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (res.ok) {
				toast.success("Post created successfully!");
				router.push("/dashboard/posts");
			} else {
				toast.error("Failed to create post.");
			}
		} catch (error) {
			toast.error("An error occurred.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/dashboard/posts">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-5 w-5" />
						</Button>
					</Link>
					<h2 className="text-2xl font-bold tracking-tight">Create New Post</h2>
				</div>
			</div>

			<form onSubmit={handleCreate}>
				<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Post Title</Label>
							<Input
								id="title"
								placeholder="Enter post title"
								type="text"
								className="bg-card"
								required
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
							/>
						</div>

						<div className="space-y-2">
							<Label>Content</Label>
							<Editor
								value={formData.content}
								onChange={(html) => setFormData({ ...formData, content: html })}
							/>
						</div>
					</div>

					<div className="space-y-4">
						<Card>
							<CardContent className="p-4 space-y-4">
								<div className="space-y-2">
									<Label htmlFor="slug">Slug (URL)</Label>
									<Input
										id="slug"
										placeholder="auto-generated"
										value={formData.slug}
										onChange={(e) =>
											setFormData({ ...formData, slug: e.target.value })
										}
									/>
								</div>

								<div className="flex items-center space-x-2 pt-2">
									<Checkbox
										id="published"
										checked={formData.published}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												published: checked as boolean,
											})
										}
									/>
									<Label htmlFor="published">Publish Immediately</Label>
								</div>

								<Button type="submit" className="w-full" disabled={loading}>
									{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create Post
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</form>
		</div>
	);
}
