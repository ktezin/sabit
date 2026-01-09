"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // useParams önemli
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
import { LoadingSpinner } from "@/components/loading";

export default function EditPostPage() {
	const router = useRouter();
	const params = useParams();
	const postId = params.id;

	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);

	const [formData, setFormData] = useState({
		title: "",
		slug: "",
		content: "",
		published: false,
	});

	useEffect(() => {
		const fetchPost = async () => {
			const token = localStorage.getItem("token");
			try {
				const res = await fetch(`${API_URL}/api/admin/posts/${postId}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const data = await res.json();
				if (data.status === "success") {
					setFormData({
						title: data.data.title,
						content: data.data.content,
						published: data.data.published,
						slug: data.data.slug,
					});
				} else {
					toast.error("Post not found");
					router.push("/dashboard/posts");
				}
			} catch (error) {
				toast.error("Error loading post");
			} finally {
				setFetching(false);
			}
		};

		if (postId) fetchPost();
	}, [postId, router]);

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const token = localStorage.getItem("token");

		try {
			const res = await fetch(`${API_URL}/api/admin/posts/${postId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			});

			if (res.ok) {
				toast.success("Post updated successfully!");
			} else {
				toast.error("Failed to update post.");
			}
		} catch (error) {
			toast.error("An error occurred.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/dashboard/posts">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-5 w-5" />
						</Button>
					</Link>
					<h2 className="text-2xl font-bold tracking-tight">Edit Post</h2>
				</div>
			</div>

			{fetching ? (
				<LoadingSpinner text="Loading Post Data..." />
			) : (
				<form onSubmit={handleUpdate}>
					<div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Post Title</Label>
								<Input
									id="title"
									type="text"
									className="bg-card"
									value={formData?.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="post-content">Content</Label>
								<Editor
									value={formData?.content}
									onChange={(html) =>
										setFormData({ ...formData, content: html })
									}
								/>
							</div>
						</div>

						<div className="space-y-4">
							<Card>
								<CardContent className="p-4 space-y-4">
									<div className="space-y-2">
										<Label htmlFor="slug">Slug</Label>
										<Input
											id="slug"
											value={formData?.slug}
											onChange={(e) =>
												setFormData({ ...formData, slug: e.target.value })
											}
										/>
									</div>

									<div className="flex items-center space-x-2 pt-2">
										<Checkbox
											id="published"
											checked={formData?.published}
											onCheckedChange={(checked) =>
												setFormData({
													...formData,
													published: checked as boolean,
												})
											}
										/>
										<Label htmlFor="published">Published</Label>
									</div>

									<Button type="submit" className="w-full" disabled={loading}>
										{loading && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Update Post
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}
