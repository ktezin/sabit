"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { RefreshCw, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";

import {
	GeneralSettingsTab,
	SettingsState,
} from "@/components/settings/general-settings";

import {
	TemplateEditorTab,
	TemplateState,
} from "@/components/settings/template-editor";

export default function SettingsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();

	const currentTab = searchParams.get("tab") || "general";

	const [loadingData, setLoadingData] = useState(true);
	const [buildLoading, setBuildLoading] = useState(false);

	const [settings, setSettings] = useState<SettingsState | null>(null);
	const [templates, setTemplates] = useState<TemplateState[]>([]);

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams);
		params.set("tab", value);
		router.replace(`${pathname}?${params.toString()}`);
	};

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			router.push("/login");
			return;
		}

		fetchData(token);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchData = async (token: string) => {
		try {
			const headers = { Authorization: `Bearer ${token}` };

			const [settingsRes, templatesRes] = await Promise.all([
				fetch(`${API_URL}/api/admin/settings`, { headers }),
				fetch(`${API_URL}/api/admin/templates`, { headers }),
			]);

			if (settingsRes.status === 401 || templatesRes.status === 401) {
				throw new Error("Unauthorized");
			}

			const settingsData = await settingsRes.json();
			const templatesData = await templatesRes.json();

			if (settingsData.status === "success") setSettings(settingsData.data);
			if (templatesData.status === "success")
				setTemplates(templatesData.data.templates);
		} catch (error: any) {
			if (error.message === "Unauthorized") {
				toast.error("Session expired.");

				localStorage.removeItem("token");

				router.push("/login");
			} else {
				toast.error("Error loading settings.");
			}
		} finally {
			setLoadingData(false);
		}
	};

	const handleBuild = async () => {
		const token = localStorage.getItem("token");

		if (!token) return router.push("/login");

		setBuildLoading(true);

		try {
			const res = await fetch(`${API_URL}/api/admin/build`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
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

	if (loadingData) {
		return <div className="p-8 text-center">Loading settings...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
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

			<Tabs
				value={currentTab}
				onValueChange={handleTabChange}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-2 lg:w-100 bg-slate-200 border-card drop-shadow-card">
					<TabsTrigger value="general">General Settings</TabsTrigger>
					<TabsTrigger value="templates">Template Editor</TabsTrigger>
				</TabsList>

				<TabsContent value="general" className="mt-6">
					{settings && <GeneralSettingsTab initialSettings={settings} />}
				</TabsContent>

				<TabsContent value="templates" className="mt-6">
					{templates.length > 0 && (
						<TemplateEditorTab initialTemplates={templates} />
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
