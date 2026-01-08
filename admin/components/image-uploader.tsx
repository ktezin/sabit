"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";

interface ImageUploaderProps {
	onUploadSuccess: (url: string) => void;
}

export function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		const formData = new FormData();
		formData.append("image", file);

		const token = localStorage.getItem("token");

		try {
			const res = await fetch(`${API_URL}/api/admin/upload`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await res.json();

			if (res.ok) {
				toast.success("Image uploaded successfully!");

				let fullUrl = data.url;
				
				if (!fullUrl.startsWith("http")) {
					fullUrl = `${API_URL}${fullUrl}`;
				}

				onUploadSuccess(fullUrl);
			} else {
				toast.error(data.message || "Upload failed.");
			}
		} catch (error) {
			toast.error("Error uploading image.");
			console.error(error);
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex items-center gap-2">
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>
			<Button
				type="button"
				variant="secondary"
				size="sm"
				disabled={uploading}
				onClick={() => fileInputRef.current?.click()}
			>
				{uploading ? (
					<Loader2 className="h-4 w-4 mr-2 animate-spin" />
				) : (
					<ImageIcon className="h-4 w-4 mr-2" />
				)}
				{uploading ? "Uploading..." : "Insert Image"}
			</Button>
		</div>
	);
}
