"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	Bold,
	Italic,
	Strikethrough,
	Heading1,
	Heading2,
	List,
	ListOrdered,
	Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/image-uploader";
import ImageResize from 'tiptap-extension-resize-image';

interface EditorProps {
	value: string;
	onChange: (html: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			ImageResize.configure({
				inline: true,
			}),
		],
		immediatelyRender: false,
		content: value,
		editorProps: {
			attributes: {
				class:
					"prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
			},
		},
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	if (!editor) {
		return null;
	}

	const addImage = (url: string) => {
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	return (
		<div className="border rounded-md shadow-sm bg-background">
			<div className="flex flex-wrap gap-1 border-b p-2 bg-muted/30">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={editor.isActive("bold") ? "bg-muted" : ""}
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={editor.isActive("italic") ? "bg-muted" : ""}
				>
					<Italic className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={editor.isActive("strike") ? "bg-muted" : ""}
				>
					<Strikethrough className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
				>
					<Heading1 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
				>
					<Heading2 className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={editor.isActive("bulletList") ? "bg-muted" : ""}
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={editor.isActive("orderedList") ? "bg-muted" : ""}
				>
					<ListOrdered className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={editor.isActive("blockquote") ? "bg-muted" : ""}
				>
					<Quote className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<ImageUploader onUploadSuccess={addImage} />
			</div>

			<div className="p-2">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}
