"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Plus,
	Search,
	Edit,
	Trash2,
	CheckCircle,
	XCircle,
	ChevronLeft,
	ChevronRight,
	Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";

interface Post {
	id: string;
	title: string;
	slug: string;
	published: boolean;
	createdAt: string;
}

interface Pagination {
	page: number;
	totalPages: number;
	totalPosts: number;
}

export default function PostsPage() {
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState<Pagination>({
		page: 1,
		totalPages: 1,
		totalPosts: 0,
	});

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/login");
			return;
		}
		fetchPosts(token);
	}, [page, search]);

	const fetchPosts = async (token: string) => {
		setLoading(true);
		try {
			const res = await fetch(
				`${API_URL}/api/admin/posts?page=${page}&limit=10&search=${search}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (res.status === 401) {
				localStorage.removeItem("token");
				router.push("/login");
				return;
			}

			const data = await res.json();
			if (data.status === "success") {
				setPosts(data.data.posts);
				setPagination(data.data.pagination);
			}
		} catch (error) {
			toast.error("An error occurred while loading posts.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this post?")) return;

		const token = localStorage.getItem("token");
		try {
			const res = await fetch(`${API_URL}/api/admin/posts/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (res.ok) {
				toast.success("Post deleted.");
				fetchPosts(token!);
			} else {
				toast.error("Delete operation failed.");
			}
		} catch (error) {
			toast.error("An error occurred.");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Posts</h2>
					<p className="text-muted-foreground">
						Manage, edit, or delete blog posts.
					</p>
				</div>
				<Link href="/dashboard/posts/new">
					<Button className="bg-blue-600 hover:bg-blue-700">
						<Plus className="mr-2 h-4 w-4" /> Add New Post
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle>Post List</CardTitle>
						<div className="relative w-full max-w-sm">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search by title..."
								className="pl-8"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setPage(1);
								}}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="text-center py-10">Loading...</div>
					) : posts.length === 0 ? (
						<div className="text-center py-10 text-muted-foreground">
							{search
								? "No posts found matching your criteria."
								: "No posts added yet."}
						</div>
					) : (
						<div className="relative w-full overflow-auto">
							<table className="w-full caption-bottom text-sm text-left">
								<thead className="[&_tr]:border-b">
									<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
										<th className="h-12 px-4 align-middle font-medium text-muted-foreground">
											Title
										</th>
										<th className="h-12 px-4 align-middle font-medium text-muted-foreground">
											Status
										</th>
										<th className="h-12 px-4 align-middle font-medium text-muted-foreground">
											Date
										</th>
										<th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="[&_tr:last-child]:border-0">
									{posts.map((post) => (
										<tr
											key={post.id}
											className="border-b transition-colors hover:bg-muted/50"
										>
											<td className="p-4 align-middle font-medium">
												<div className="flex flex-col">
													<span>{post.title}</span>
													<span className="text-xs text-muted-foreground font-normal">
														/{post.slug}
													</span>
												</div>
											</td>
											<td className="p-4 align-middle">
												{post.published ? (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
														<CheckCircle className="w-3 h-3 mr-1" /> Published
													</span>
												) : (
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
														<XCircle className="w-3 h-3 mr-1" /> Draft
													</span>
												)}
											</td>
											<td className="p-4 align-middle">
												{new Date(post.createdAt).toLocaleDateString("en-US")}
											</td>
											<td className="p-4 align-middle text-right">
												<div className="flex justify-end gap-2">
													<Link
														href={`${API_URL}/${post.slug}`}
														target="_blank"
													>
														<Button
															variant="outline"
															size="icon"
															className="h-8 w-8"
														>
															<Eye className="h-4 w-4" />
														</Button>
													</Link>
													<Link href={`/dashboard/posts/${post.id}`}>
														<Button
															variant="outline"
															size="icon"
															className="h-8 w-8"
														>
															<Edit className="h-4 w-4" />
														</Button>
													</Link>
													<Button
														variant="destructive"
														size="icon"
														className="h-8 w-8"
														onClick={() => handleDelete(post.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{pagination.totalPages > 1 && (
						<div className="flex items-center justify-end space-x-2 py-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								<ChevronLeft className="h-4 w-4 mr-1" /> Previous
							</Button>
							<div className="text-sm text-muted-foreground">
								Page {pagination.page} / {pagination.totalPages}
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setPage((p) => Math.min(pagination.totalPages, p + 1))
								}
								disabled={page === pagination.totalPages}
							>
								Next <ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
