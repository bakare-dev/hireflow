import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../../utils/classnames";

function RichTextEditor({
	value = "",
	onChange,
	placeholder = "Start typing...",
	className,
	minHeight = "200px",
	maxLength = 5000,
	editable = true,
	showToolbar = true,
	showCharacterCount = true,
	contentClassName = "",
}) {
	const [mounted, setMounted] = useState(false);
	const [charCount, setCharCount] = useState(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	const extensions = useMemo(
		() => [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			Underline,
			BulletList,
			OrderedList,
			ListItem,
			Link.configure({
				openOnClick: true,
				HTMLAttributes: {
					class: "text-blue-600 underline",
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
		],
		[placeholder],
	);

	const editor = useEditor({
		extensions,
		content: value || "",
		editable,
		immediatelyRender: false,

		onUpdate: ({ editor }) => {
			const html = editor.getHTML();

			if (html.length > maxLength) {
				editor.commands.undo();
				return;
			}

			setCharCount(html.length);

			if (onChange) {
				onChange(html);
			}
		},

		editorProps: {
			attributes: {
				class: cn(
					"w-full rounded-md p-4 focus:outline-none prose prose-sm max-w-none",
					"overflow-y-auto",
					"[&_ul]:list-disc [&_ul]:pl-6",
					"[&_ol]:list-decimal [&_ol]:pl-6",
					"[&_li]:mb-1",
					contentClassName,
				),
				style: `min-height:${minHeight}`,
				spellcheck: "false",
			},
		},
	});

	useEffect(() => {
		if (!editor) return;

		const current = editor.getHTML();
		const incoming = value || "";

		if (current !== incoming && !editor.isFocused) {
			editor.commands.setContent(incoming, false);
			setCharCount(incoming.length);
		}
	}, [value, editor]);

	if (!mounted || !editor) return null;

	const toolbarButtons = [
		{
			label: "B",
			action: () => editor.chain().focus().toggleBold().run(),
			active: editor.isActive("bold"),
		},
		{
			label: "I",
			action: () => editor.chain().focus().toggleItalic().run(),
			active: editor.isActive("italic"),
		},
		{
			label: "U",
			action: () => editor.chain().focus().toggleUnderline().run(),
			active: editor.isActive("underline"),
		},
		{
			label: "H1",
			action: () =>
				editor.chain().focus().toggleHeading({ level: 1 }).run(),
			active: editor.isActive("heading", { level: 1 }),
		},
		{
			label: "H2",
			action: () =>
				editor.chain().focus().toggleHeading({ level: 2 }).run(),
			active: editor.isActive("heading", { level: 2 }),
		},
		{
			label: "H3",
			action: () =>
				editor.chain().focus().toggleHeading({ level: 3 }).run(),
			active: editor.isActive("heading", { level: 3 }),
		},
		{
			label: "UL",
			action: () => editor.chain().focus().toggleBulletList().run(),
			active: editor.isActive("bulletList"),
		},
		{
			label: "OL",
			action: () => editor.chain().focus().toggleOrderedList().run(),
			active: editor.isActive("orderedList"),
		},
	];

	const alignments = ["left", "center", "right"];

	return (
		<div
			className={cn(
				"rounded-md border border-slate-300 bg-white overflow-hidden",
				"focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200",
				className,
			)}
		>
			{showToolbar && (
				<div className="flex flex-wrap items-center gap-2 border-b p-2 bg-slate-50">
					{toolbarButtons.map((btn) => (
						<button
							key={btn.label}
							type="button"
							onMouseDown={(e) => e.preventDefault()}
							onClick={btn.action}
							className={cn(
								"px-2 py-1 text-sm border rounded transition",
								btn.active
									? "bg-slate-900 text-white border-slate-900"
									: "bg-white hover:bg-slate-100",
							)}
						>
							{btn.label}
						</button>
					))}

					<div className="ml-auto flex gap-1">
						{alignments.map((align) => (
							<button
								key={align}
								type="button"
								onMouseDown={(e) => e.preventDefault()}
								onClick={() =>
									editor
										.chain()
										.focus()
										.setTextAlign(align)
										.run()
								}
								className={cn(
									"px-2 py-1 text-sm border rounded capitalize",
									editor.isActive({ textAlign: align })
										? "bg-slate-900 text-white"
										: "bg-white hover:bg-slate-100",
								)}
							>
								{align[0].toUpperCase()}
							</button>
						))}
					</div>
				</div>
			)}

			<EditorContent editor={editor} />

			{showCharacterCount && (
				<div className="flex justify-end border-t px-3 py-2">
					<span
						className={cn(
							"text-xs",
							charCount > maxLength * 0.9
								? "text-orange-500"
								: "text-slate-500",
						)}
					>
						{charCount}/{maxLength}
					</span>
				</div>
			)}
		</div>
	);
}

export default RichTextEditor;
