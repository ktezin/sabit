"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";
import { Bold, Italic, List, Heading2 } from "lucide-react";

interface EditorProps {
	value: string;
	onChange: (html: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
	const editor = useEditor({
		extensions: [StarterKit],
		content: value,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm sm:prose max-w-none dark:prose-invert",
			},
		},
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	if (!editor) {
		return null;
	}

	const toggleBold = () => editor.chain().focus().toggleBold().run();
	const toggleItalic = () => editor.chain().focus().toggleItalic().run();
	const toggleH2 = () =>
		editor.chain().focus().toggleHeading({ level: 2 }).run();
	const toggleBulletList = () =>
		editor.chain().focus().toggleBulletList().run();

	return (
		<div className="flex flex-col gap-2 border rounded-md overflow-hidden bg-white dark:bg-zinc-900">
			<div className="flex items-center gap-1 border-b bg-muted/40 p-1">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={toggleBold}
					className={editor.isActive("bold") ? "bg-muted" : ""}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={toggleItalic}
					className={editor.isActive("italic") ? "bg-muted" : ""}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<div className="w-px h-6 bg-border mx-1" />
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={toggleH2}
					className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
				>
					<Heading2 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={toggleBulletList}
					className={editor.isActive("bulletList") ? "bg-muted" : ""}
				>
					<List className="h-4 w-4" />
				</Button>
			</div>

			<EditorContent editor={editor} className="p-2" />
		</div>
	);
}
