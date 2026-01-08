"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
	LayoutDashboard,
	FileText,
	Settings,
	LogOut,
	Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			router.push("/login");
		}
	}, [router]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		router.push("/login");
	};

	const navItems = [
		{ name: "Overview", href: "/dashboard", icon: LayoutDashboard },
		{ name: "Posts", href: "/dashboard/posts", icon: FileText },
		{ name: "Settings", href: "/dashboard/settings", icon: Settings },
	];

	return (
		<div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex">
			<aside
				className={`${
					isSidebarOpen ? "w-64" : "w-20"
				} bg-white dark:bg-zinc-900 border-r transition-all duration-300 flex flex-col fixed h-full z-10`}
			>
				<div className="h-16 flex items-center justify-center border-b">
					<h1 className={`font-bold text-xl ${!isSidebarOpen && "hidden"}`}>
						Sabit CMS
					</h1>
				</div>

				<nav className="flex-1 p-4 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
									isActive
										? "bg-primary text-primary-foreground"
										: "hover:bg-gray-100 dark:hover:bg-zinc-800"
								}`}
							>
								<Icon size={20} />
								<span className={!isSidebarOpen ? "hidden" : ""}>
									{item.name}
								</span>
							</Link>
						);
					})}
				</nav>

				<div className="p-4 border-t">
					<Button
						variant="ghost"
						className="w-full flex items-center gap-3 justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
						onClick={handleLogout}
					>
						<LogOut size={20} />
						<span className={!isSidebarOpen ? "hidden" : ""}>Logout</span>
					</Button>
				</div>
			</aside>

			<div
				className={`flex-1 flex flex-col transition-all duration-300 ${
					isSidebarOpen ? "ml-64" : "ml-20"
				}`}
			>
				<header className="h-16 bg-white dark:bg-zinc-900 border-b flex items-center justify-between px-6 sticky top-0 z-10">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					>
						<Menu />
					</Button>

					<div className="flex items-center gap-4">
						<span className="text-sm text-gray-500">Welcome, Admin</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage src="/avatars/01.png" alt="Admin" />
										<AvatarFallback>AD</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">Admin</p>
										<p className="text-xs leading-none text-muted-foreground">
											admin@sabit.com
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-red-500 cursor-pointer"
								>
									Logout
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</header>

				<main className="p-6">{children}</main>
			</div>
		</div>
	);
}
