"use client";

import { useState } from "react";
import { Save, RefreshCw } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface SettingsState {
	siteTitle: string;
	siteDescription: string;
	footerText: string;
	activeTheme: string;
}

interface GeneralSettingsTabProps {
	initialSettings: SettingsState;
}

export function GeneralSettingsTab({
	initialSettings,
}: GeneralSettingsTabProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [settings, setSettings] = useState<SettingsState>(initialSettings);

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
			const res = await fetch(`${API_URL}/api/admin/settings`, {
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

	return (
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
						This setting determines which theme files will be generated in the
						dist folder during build.
					</p>
				</div>

				<div className="pt-4 flex justify-end">
					<Button onClick={handleSaveSettings} disabled={loading}>
						{loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
						<Save className="mr-2 h-4 w-4" /> Save Changes
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
