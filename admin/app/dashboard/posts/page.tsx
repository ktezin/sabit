"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Post {
	id: string;
	title: string;
	slug: string;
	published: boolean;
	createdAt: string;
}

export default function PostsPage() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchPosts = async () => {
			const token = localStorage.getItem("token");
			const res = await fetch("http://localhost:3000/api/admin/posts", {
				headers: { Authorization: `Bearer ${token}` },
			});
			const json = await res.json();
			if (json.status === "success") {
				setPosts(json.data);
			}
			setLoading(false);
		};

		fetchPosts();
	}, []);

	const handleDelete = async (id: string) => {
		if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;

		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`http://localhost:3000/api/admin/posts/${id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (res.ok) {
				setPosts((prev) => prev.filter((post) => post.id !== id));
			} else {
				alert("Silme işlemi başarısız oldu.");
			}
		} catch (error) {
			console.error(error);
			alert("Bir hata oluştu.");
		}
	};

	if (loading) return <div className="p-4">Yükleniyor...</div>;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Yazılar</h2>
				<Link href="/dashboard/posts/new">
					<Button>
						<Plus className="mr-2 h-4 w-4" /> Yeni Yazı Ekle
					</Button>
				</Link>
			</div>

			<div className="border rounded-md">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Başlık</TableHead>
							<TableHead>Slug (URL)</TableHead>
							<TableHead>Durum</TableHead>
							<TableHead>Tarih</TableHead>
							<TableHead className="text-right">İşlemler</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{posts.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={5}
									className="text-center h-24 text-muted-foreground"
								>
									Henüz hiç yazı yok.
								</TableCell>
							</TableRow>
						) : (
							posts.map((post) => (
								<TableRow key={post.id}>
									<TableCell className="font-medium">{post.title}</TableCell>
									<TableCell className="text-muted-foreground">
										{post.slug}
									</TableCell>
									<TableCell>
										<Badge variant={post.published ? "default" : "secondary"}>
											{post.published ? "Yayında" : "Taslak"}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(post.createdAt).toLocaleDateString("tr-TR")}
									</TableCell>
									<TableCell className="text-right">
										<Link href={`/dashboard/posts/${post.id}`}>
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-slate-300"
											>
												<Pencil className="h-4 w-4" />
											</Button>
										</Link>
										<Button
											variant="ghost"
											size="icon"
											className="text-red-500 hover:text-red-600 hover:bg-slate-300"
											onClick={() => handleDelete(post.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
