"use client";

import { useEffect, useState } from "react";
import { Copy, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { API_URL } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface FileItem {
	name: string;
	url: string;
}

export default function MediaPage() {
	const [fetching, setFetching] = useState(true);
	const [files, setFiles] = useState<FileItem[]>([]);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		fetchFiles();
	}, []);

	const fetchFiles = async () => {
		const token = localStorage.getItem("token");
		try {
			const res = await fetch(`${API_URL}/api/admin/uploads`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await res.json();

			setFiles(data.data?.files || data.files || []);
		} catch (error) {
			toast.error("Error loading files");
		} finally {
			setFetching(false);
		}
	};

	const handleDelete = async (filename: string) => {
		if (!confirm("Are you sure you want to delete this file?")) return;

		setDeletingId(filename);
		const token = localStorage.getItem("token");

		try {
			const res = await fetch(`${API_URL}/api/admin/uploads/${filename}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!res.ok) throw new Error("Failed");

			toast.success("File deleted!");

			setFiles((prev) => prev.filter((f) => f.name !== filename));
		} catch (error) {
			toast.error("Error deleting file");
		} finally {
			setDeletingId(null);
		}
	};

	const handleCopy = (url: string) => {
		const fullUrl = `${API_URL}${url}`;
		navigator.clipboard.writeText(fullUrl);
		toast.success("URL copied to clipboard!");
	};

	if (fetching)
		return (
			<div className="p-8 text-center text-muted-foreground">
				Loading media library...
			</div>
		);

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
					<p className="text-muted-foreground">
						Manage your uploaded assets ({files.length} items)
					</p>
				</div>
			</div>

			{files.length === 0 ? (
				<div className="text-center py-12 border-2 border-dashed rounded-lg">
					<ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
						No media files
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						Upload images while creating posts.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{files.map((file) => (
						<Card key={file.name} className="overflow-hidden group">
							<CardContent className="p-0">
								<Link
									href={`${API_URL}${file.url}`}
									target="_blank"
									className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden"
								>
									<img
										src={`${API_URL}${file.url}`}
										alt={file.name}
										className="object-cover w-full h-full transition-transform group-hover:scale-105"
										loading="lazy"
									/>
								</Link>
							</CardContent>

							<CardHeader className="p-3 pb-0">
								<div className="font-medium text-md truncate" title={file.name}>
									{file.name}
								</div>
							</CardHeader>

							<CardFooter className="p-3 grid grid-cols-2 gap-2">
								<Button
									variant="secondary"
									className="hover:bg-slate-200"
									onClick={() => handleCopy(file.url)}
								>
									<Copy className="h-3 w-3 mr-2" /> Copy
								</Button>

								<Button
									variant="destructive"
									className="hover:bg-red-400"
									disabled={deletingId === file.name}
									onClick={() => handleDelete(file.name)}
								>
									{deletingId === file.name ? (
										<Loader2 className="h-3 w-3 animate-spin" />
									) : (
										<Trash2 className="h-3 w-3" />
									)}
									Delete
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
