"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
	FileText,
	CheckCircle,
	Edit3,
	Plus,
	ExternalLink,
	Zap,
	Clock,
	Image,
	Eye,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/utils";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading";

interface DashboardData {
	counts: {
		total: number;
		published: number;
		draft: number;
	};
	recentPosts: Array<{
		id: string;
		title: string;
		slug: string;
		published: boolean;
		updatedAt: string;
	}>;
}

interface MediaData {
	results: number;
	total: number;
	files: Array<{
		name: string;
		url: string;
		time: number;
	}>;
}

export default function DashboardPage() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [mediaData, setMediaData] = useState<MediaData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			const token = localStorage.getItem("token");
			try {
				const res = await fetch(`${API_URL}/api/admin/dashboard`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const json = await res.json();
				if (json.status === "success") {
					setData(json.data);
				}

				const resMedia = await fetch(`${API_URL}/api/admin/uploads?limit=3`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const jsonMedia = await resMedia.json();
				if (json.status === "success") {
					setMediaData(jsonMedia.data);
				}
			} catch (error) {
				toast.error("Failed to load dashboard stats.");
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	return (
		<div className="space-y-8">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Overview</h2>
					<p className="text-muted-foreground">
						Monitor your content status and take quick actions.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Link href={`${API_URL}/`} target="_blank">
						<Button variant="outline">
							<ExternalLink className="mr-2 h-4 w-4" /> View Site
						</Button>
					</Link>
					<Link href="/dashboard/posts/new">
						<Button className="bg-blue-600 hover:bg-blue-700">
							<Plus className="mr-2 h-4 w-4" /> Create New Post
						</Button>
					</Link>
				</div>
			</div>

			{loading ? (
				<LoadingSpinner text="Loading Dashboard..." />
			) : (
				<div className="space-y-6">
					<div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
						<Card className="hover:shadow-sm transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Content
								</CardTitle>
								<FileText className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data?.counts.total}</div>
								<p className="text-xs text-muted-foreground">
									All posts in database
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-sm transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Published</CardTitle>
								<CheckCircle className="h-4 w-4 text-green-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{data?.counts.published}
								</div>
								<p className="text-xs text-muted-foreground">
									Visible to visitors
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-sm transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Drafts</CardTitle>
								<Edit3 className="h-4 w-4 text-yellow-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{data?.counts.draft}</div>
								<p className="text-xs text-muted-foreground">
									Work in progress
								</p>
							</CardContent>
						</Card>

						<Card className="hover:shadow-sm transition-shadow">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Media</CardTitle>
								<Image className="h-4 w-4 text-emerald-600" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{mediaData?.total}</div>
								<p className="text-xs text-muted-foreground">
									All files uploaded
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-6">
							<Card className="h-full">
								<CardHeader>
									<CardTitle>Recently Updated</CardTitle>
									<CardDescription>
										The last 5 posts you worked on.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{data?.recentPosts.length === 0 ? (
											<div className="text-center py-6 text-muted-foreground text-sm">
												No content created yet.
											</div>
										) : (
											data?.recentPosts.map((post) => (
												<div
													key={post.id}
													className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40 transition-colors group"
												>
													<div className="flex items-center space-x-4">
														<div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
															<FileText className="h-4 w-4 text-primary" />
														</div>
														<div>
															<p className="text-sm font-medium leading-none">
																{post.title}
															</p>
															<p className="text-xs text-muted-foreground mt-1 font-mono">
																/{post.slug}
															</p>
														</div>
													</div>
													<div className="flex items-center gap-4">
														<div className="text-right hidden sm:block">
															<p className="text-xs text-muted-foreground">
																{new Date(post.updatedAt).toLocaleDateString(
																	"en-US"
																)}
															</p>
															<div className="flex justify-end mt-1">
																<span
																	className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
																		post.published
																			? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
																			: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
																	}`}
																>
																	{post.published ? "Published" : "Draft"}
																</span>
															</div>
														</div>
														<Link href={`/dashboard/posts/edit/${post.id}`}>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
															>
																<Edit3 className="h-4 w-4" />
															</Button>
														</Link>
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						<div className="lg:col-span-1 space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Recently Uploaded</CardTitle>
									<CardDescription>Latest files.</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										{mediaData?.results === 0 ? (
											<p className="text-sm text-muted-foreground text-center py-4">
												No files yet.
											</p>
										) : (
											mediaData?.files.map((file) => (
												<div
													key={file.name}
													className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
												>
													<div className="h-10 w-10 relative bg-muted rounded overflow-hidden shrink-0 border">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img
															src={`${API_URL}${file.url}`}
															alt={file.name}
															className="h-full w-full object-cover"
														/>
													</div>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium truncate">
															{file.name}
														</p>
														<p className="text-[10px] text-muted-foreground">
															{new Date(file.time).toLocaleDateString("en-US")}
														</p>
													</div>
													<Link href={`${API_URL}${file.url}`} target="_blank">
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6"
														>
															<Eye className="h-3 w-3" />
														</Button>
													</Link>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Zap className="h-4 w-4 text-amber-500" /> System Status
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
										<span className="text-sm font-medium">Engine</span>
										<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold dark:bg-green-900/30 dark:text-green-400">
											Active
										</span>
									</div>

									<div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
										<span className="text-sm font-medium">Cache</span>
										<span className="text-xs text-muted-foreground">
											ISR Enabled
										</span>
									</div>

									<div className="pt-2">
										<Link href="/dashboard/settings">
											<Button
												variant="outline"
												size="sm"
												className="w-full text-xs h-8"
											>
												Manage Settings
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
