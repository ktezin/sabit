"use client";

import { useEffect, useState } from "react";
import {
	Save,
	RefreshCw,
	Code,
	Monitor,
	Smartphone,
	Loader2,
	Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";
import { API_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";

const PREVIEW_INJECT_SCRIPT = `
<script>
  document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        e.preventDefault();
        console.log('Preview Mode: Navigation prevented');
      }
    });
    document.body.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Preview Mode: Form submission prevented');
    });
  });
</script>
<style>
  a { cursor: not-allowed !important; }
</style>
`;

export interface TemplateState {
	id: string;
	name: string;
	type: string;
	content: string;
}

interface TemplateEditorTabProps {
	initialTemplates: TemplateState[];
}

export function TemplateEditorTab({
	initialTemplates,
}: TemplateEditorTabProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [templates, setTemplates] = useState<TemplateState[]>(initialTemplates);
	const [selectedTemplateType, setSelectedTemplateType] =
		useState<string>("index");

	const initialContent =
		templates.find((t) => t.type === "index")?.content || "";
	const [editorContent, setEditorContent] = useState<string>(initialContent);

	const [previewHtml, setPreviewHtml] = useState("");
	const [previewLoading, setPreviewLoading] = useState(false);
	const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
		"desktop"
	);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (editorContent) {
				fetchPreview();
			}
		}, 1000);
		return () => clearTimeout(timeoutId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editorContent, selectedTemplateType]);

	const fetchPreview = async () => {
		setPreviewLoading(true);
		const token = localStorage.getItem("token");
		try {
			const res = await fetch(`${API_URL}/api/admin/templates/preview`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					content: editorContent,
					type: selectedTemplateType,
				}),
			});

			const data = await res.json();
			if (data.status === "success") {
				setPreviewHtml(data.html);
			} else {
				setPreviewHtml(
					`<div style="color:red; padding:20px;"><h3>Preview Error</h3><p>${data.message}</p></div>`
				);
			}
		} catch (error) {
			console.error("Preview error", error);
		} finally {
			setPreviewLoading(false);
		}
	};

	const handleTemplateSelect = (type: string) => {
		setSelectedTemplateType(type);
		const template = templates.find((t) => t.type === type);
		if (template) {
			setEditorContent(template.content);
		}
	};

	const handleSaveTemplate = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");

		setLoading(true);
		try {
			const res = await fetch(
				`${API_URL}/api/admin/templates/${selectedTemplateType}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editorContent }),
				}
			);

			if (res.status === 401) throw new Error("Unauthorized");

			if (res.ok) {
				const updatedTemplates = templates.map((t) =>
					t.type === selectedTemplateType ? { ...t, content: editorContent } : t
				);
				setTemplates(updatedTemplates);
				toast.success("Template updated and cache cleared.");
			}
		} catch (error: any) {
			if (error.message === "Unauthorized") router.push("/login");
			else toast.error("Failed to save template.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh] min-h-150">
			<Card className="flex flex-col overflow-hidden h-full py-0 gap-0">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<Code className="h-4 w-4 text-blue-500" />
						<span className="font-semibold text-sm">Editor</span>
					</div>
					<div className="w-45">
						<Select
							value={selectedTemplateType}
							onValueChange={handleTemplateSelect}
						>
							<SelectTrigger className="h-8 w-full">
								<SelectValue placeholder="Select Template" />
							</SelectTrigger>
							<SelectContent className="w-full">
								{templates.map((t) => (
									<SelectItem key={t.id} value={t.type}>
										{t.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className="flex-1 p-0 relative bg-[#1e1e1e]">
					<Editor
						height="100%"
						defaultLanguage="html"
						language="html"
						theme="vs-dark"
						value={editorContent}
						onChange={(value) => setEditorContent(value || "")}
						options={{
							minimap: { enabled: false },
							fontSize: 13,
							wordWrap: "on",
							padding: { top: 10 },
						}}
					/>
				</CardContent>
				<div className="p-2 border-t bg-background flex justify-end">
					<Button onClick={handleSaveTemplate} disabled={loading} size="sm">
						{loading ? (
							<RefreshCw className="mr-2 h-3 w-3 animate-spin" />
						) : (
							<Save className="mr-2 h-3 w-3" />
						)}
						Save Template
					</Button>
				</div>
			</Card>

			<Card className="flex flex-col overflow-hidden h-full border-zinc-200 dark:border-zinc-800 py-0 gap-0">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b bg-muted/30">
					<div className="flex items-center gap-2">
						<Eye className="h-4 w-4 text-green-500" />
						<span className="font-semibold text-sm">Live Preview</span>
						{previewLoading && (
							<Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-2" />
						)}
					</div>
					<div className="flex bg-background rounded-md border p-1 gap-1">
						<Button
							variant="ghost"
							size="icon"
							className={`h-6 w-6 ${
								previewDevice === "desktop" ? "bg-muted" : ""
							}`}
							onClick={() => setPreviewDevice("desktop")}
						>
							<Monitor className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={`h-6 w-6 ${
								previewDevice === "mobile" ? "bg-muted" : ""
							}`}
							onClick={() => setPreviewDevice("mobile")}
						>
							<Smartphone className="h-3 w-3" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 p-0 bg-zinc-100 dark:bg-zinc-950 relative flex items-center justify-center overflow-auto">
					<div
						className={`transition-all duration-300 bg-white border shadow-sm ${
							previewDevice === "mobile" ? "w-94 h-165" : "w-full h-full"
						}`}
					>
						<iframe
							srcDoc={previewHtml ? previewHtml + PREVIEW_INJECT_SCRIPT : ""}
							title="Template Preview"
							className="w-full h-full border-0"
							sandbox="allow-scripts allow-same-origin"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
