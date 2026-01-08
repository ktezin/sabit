"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Token yoksa redirect için
import { Save, RefreshCw, Code, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Editor from "@monaco-editor/react";

interface SettingsState {
	siteTitle: string;
	siteDescription: string;
	footerText: string;
	activeTheme: string;
}

interface TemplateState {
	id: string;
	name: string;
	type: string;
	content: string;
}

export default function SettingsPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [buildLoading, setBuildLoading] = useState(false);

	const [settings, setSettings] = useState<SettingsState>({
		siteTitle: "",
		siteDescription: "",
		footerText: "",
		activeTheme: "default",
	});

	const [templates, setTemplates] = useState<TemplateState[]>([]);
	const [selectedTemplateType, setSelectedTemplateType] =
		useState<string>("index");
	const [editorContent, setEditorContent] = useState<string>("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/login");
			return;
		}
		fetchData(token);
	}, [router]);

	const fetchData = async (token: string) => {
		try {
			const headers = {
				Authorization: `Bearer ${token}`,
			};

			const [settingsRes, templatesRes] = await Promise.all([
				fetch("http://localhost:3000/api/admin/settings", { headers }),
				fetch("http://localhost:3000/api/admin/templates", { headers }),
			]);

			if (settingsRes.status === 401 || templatesRes.status === 401) {
				throw new Error("Unauthorized");
			}

			const settingsData = await settingsRes.json();
			const templatesData = await templatesRes.json();

			if (settingsData.status === "success") {
				setSettings(settingsData.data);
			}

			if (templatesData.status === "success") {
				setTemplates(templatesData.data.templates);
				const initialTemplate = templatesData.data.templates.find(
					(t: any) => t.type === "index"
				);
				if (initialTemplate) setEditorContent(initialTemplate.content);
			}
		} catch (error: any) {
			if (error.message === "Unauthorized") {
				toast.error("Session expired.");
				localStorage.removeItem("token");
				router.push("/login");
			} else {
				console.error("Data fetch error:", error);
				toast.error("An error occurred while loading data.");
			}
		}
	};

	const handleSettingsChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setSettings({ ...settings, [e.target.name]: e.target.value });
	};

	const handleSaveSettings = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");

		setLoading(true);
		try {
			const res = await fetch("http://localhost:3000/api/admin/settings", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(settings),
			});

			if (res.status === 401) throw new Error("Unauthorized");

			const data = await res.json();
			if (data.status === "success") {
				toast.success("Settings saved successfully.");
			}
		} catch (error: any) {
			if (error.message === "Unauthorized") router.push("/login");
			else toast.error("Save failed.");
		} finally {
			setLoading(false);
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
				`http://localhost:3000/api/admin/templates/${selectedTemplateType}`,
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

	const handleBuild = async () => {
		const token = localStorage.getItem("token");
		if (!token) return router.push("/login");

		setBuildLoading(true);
		try {
			const res = await fetch("http://localhost:3000/api/admin/build", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (res.status === 401) throw new Error("Unauthorized");

			const data = await res.json();

			if (data.status === "success") {
				toast.success(`Site built successfully!`);
			}
		} catch (error: any) {
			if (error.message === "Unauthorized") router.push("/login");
			else toast.error("Build process failed.");
		} finally {
			setBuildLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">Settings</h2>
					<p className="text-muted-foreground">
						Manage the general configuration and appearance of your site.
					</p>
				</div>
				<Button
					onClick={handleBuild}
					disabled={buildLoading}
					className="bg-emerald-600 hover:bg-emerald-700 text-white"
				>
					{buildLoading ? (
						<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<Monitor className="mr-2 h-4 w-4" />
					)}
					{buildLoading ? "Building Site..." : "Build Site"}
				</Button>
			</div>

			<Tabs defaultValue="general" className="w-full">
				<TabsList className="grid w-full grid-cols-2 lg:w-100">
					<TabsTrigger value="general">General Settings</TabsTrigger>
					<TabsTrigger value="templates">Template Editor</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="mt-6 space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Site Information</CardTitle>
							<CardDescription>
								Basic information to appear in SEO and footer areas.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1">
								<Label htmlFor="siteTitle">Site Title</Label>
								<Input
									id="siteTitle"
									name="siteTitle"
									value={settings.siteTitle}
									onChange={handleSettingsChange}
									placeholder="Ex: My Awesome Blog"
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="siteDescription">Site Description</Label>
								<Textarea
									id="siteDescription"
									name="siteDescription"
									value={settings.siteDescription}
									onChange={handleSettingsChange}
									placeholder="A short description about your site..."
								/>
							</div>
							<div className="space-y-1">
								<Label htmlFor="footerText">Footer Text</Label>
								<Input
									id="footerText"
									name="footerText"
									value={settings.footerText}
									onChange={handleSettingsChange}
									placeholder="© 2026 All rights reserved."
								/>
							</div>

							<div className="space-y-1">
								<Label>Theme Selection</Label>
								<Select
									value={settings.activeTheme}
									onValueChange={(val) =>
										setSettings({ ...settings, activeTheme: val })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Theme" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="dark">Dark Mode</SelectItem>
										<SelectItem value="minimal">Minimalist</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground mt-1">
									This setting determines which theme files will be generated in
									the dist folder during build.
								</p>
							</div>

							<div className="pt-4 flex justify-end">
								<Button onClick={handleSaveSettings} disabled={loading}>
									{loading && (
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
									)}
									<Save className="mr-2 h-4 w-4" /> Save Changes
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="templates" className="mt-6">
					<Card className="min-h-150 flex flex-col overflow-hidden">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
							<div className="space-y-1">
								<CardTitle className="flex items-center gap-2">
									<Code className="h-5 w-5 text-blue-500" /> HTML Template
									Editor
								</CardTitle>
								<CardDescription>
									Edit HTML codes in LiquidJS format.
								</CardDescription>
							</div>

							<div className="w-50">
								<Select
									value={selectedTemplateType}
									onValueChange={handleTemplateSelect}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select Template" />
									</SelectTrigger>
									<SelectContent>
										{templates.map((t) => (
											<SelectItem key={t.id} value={t.type}>
												{t.name} ({t.type})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent className="flex-1 p-0 flex flex-col bg-[#1e1e1e]">
							<div className="flex-1">
								<Editor
									height="600px"
									defaultLanguage="html"
									language="html"
									theme="vs-dark"
									value={editorContent}
									onChange={(value) => setEditorContent(value || "")}
									options={{
										minimap: { enabled: false },
										fontSize: 14,
										wordWrap: "on",
										formatOnPaste: true,
										formatOnType: true,
										automaticLayout: true,
									}}
								/>
							</div>

							<div className="p-4 border-t border-zinc-700 bg-zinc-900 flex justify-between items-center">
								<span className="text-xs text-zinc-400">
									Editor: Monaco (VS Code) Engine
								</span>
								<Button
									onClick={handleSaveTemplate}
									disabled={loading}
									className="bg-blue-600 hover:bg-blue-700"
								>
									{loading ? "Saving..." : "Save Template"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
