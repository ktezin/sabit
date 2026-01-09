import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/spinner";

interface LoadingSpinnerProps {
	className?: string;
	text?: string;
}

export function LoadingSpinner({
	className,
	text = "Loading...",
}: LoadingSpinnerProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-12 space-y-4 h-dvh",
				className
			)}
		>
			<Spinner className="size-8" />
			{text && (
				<p className="text-sm text-muted-foreground font-medium">{text}</p>
			)}
		</div>
	);
}
