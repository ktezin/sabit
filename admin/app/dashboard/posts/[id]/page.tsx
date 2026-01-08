"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // useParams is important
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import Editor from "@/components/editor";

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams();
	const postId = params.id;

	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);

	const [formData, setFormData] = useState({
		title: "",
		content: "",
		published: false,
		slug: "",
	});

	useEffect(() => {
		const fetchPost = async () => {
			const token = localStorage.getItem("token");

			const res = await fetch(
				`http://localhost:3000/api/admin/posts/${postId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (res.ok) {
				const json = await res.json();
				setFormData({
					title: json.data.title,
					content: json.data.content,
					published: json.data.published,
					slug: json.data.slug,
				});
			}
			setFetching(false);
		};

		if (postId) fetchPost();
	}, [postId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const token = localStorage.getItem("token");
			const res = await fetch(
				`http://localhost:3000/api/admin/posts/${postId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(formData),
				}
			);

			if (!res.ok) throw new Error("Update failed");

			router.push("/dashboard/posts");
			router.refresh();
		} catch (error) {
			alert("An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (fetching) return <div className="p-6">Loading data...</div>;

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" onClick={() => router.back()}>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-6 border p-6 rounded-lg bg-white dark:bg-zinc-900"
			>
				<div className="space-y-2">
					<Label htmlFor="title">Title</Label>
					<Input
						id="title"
						value={formData.title}
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="slug">URL (Slug)</Label>
					<Input
						id="slug"
						value={formData.slug}
						onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
					/>
					<p className="text-xs text-muted-foreground">
						Warning: Changing the URL might break old links.
					</p>
				</div>

				<div className="space-y-2">
					<Label htmlFor="content">Content</Label>
					{!fetching && (
						<Editor
							value={formData.content}
							onChange={(html) => setFormData({ ...formData, content: html })}
						/>
					)}
				</div>

				<div className="flex items-center justify-between border p-4 rounded-md">
					<Label>Publish</Label>
					<Switch
						checked={formData.published}
						onCheckedChange={(checked) =>
							setFormData({ ...formData, published: checked })
						}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={loading}>
					{loading ? (
						"Saving..."
					) : (
						<>
							<Save className="mr-2 h-4 w-4" /> Save Changes
						</>
					)}
				</Button>
			</form>
		</div>
	);
}
