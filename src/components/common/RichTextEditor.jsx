import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "../../utils/classnames";

const TOOLBAR_ITEMS = [
	{ label: "B", title: "Bold", action: (e) => e.chain().focus().toggleBold().run(), isActive: (e) => e.isActive("bold") },
	{ label: "I", title: "Italic", action: (e) => e.chain().focus().toggleItalic().run(), isActive: (e) => e.isActive("italic") },
	{ label: "•—", title: "Bullet list", action: (e) => e.chain().focus().toggleBulletList().run(), isActive: (e) => e.isActive("bulletList") },
	{ label: "1—", title: "Ordered list", action: (e) => e.chain().focus().toggleOrderedList().run(), isActive: (e) => e.isActive("orderedList") },
];

function RichTextEditor({ value, onChange, placeholder = "Start typing…" }) {
	const editor = useEditor({
		extensions: [StarterKit],
		content: value || "<p></p>",
		editorProps: {
			attributes: {
				class: "min-h-[120px] px-3 py-2.5 text-sm text-slate-700 focus:outline-none prose prose-sm max-w-none",
			},
		},
		onUpdate({ editor }) {
			onChange(editor.getHTML());
		},
	});

	useEffect(() => {
		if (!editor) return;
		const current = editor.getHTML();
		if (value !== undefined && value !== current) {
			editor.commands.setContent(value || "<p></p>", false);
		}
	}, [value, editor]);

	return (
		<div className="overflow-hidden rounded-md border border-slate-200 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200">
			<div className="flex gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
				{TOOLBAR_ITEMS.map(({ label, title, action, isActive }) => (
					<button
						key={title}
						type="button"
						title={title}
						onMouseDown={(e) => {
							e.preventDefault();
							action(editor);
						}}
						className={cn(
							"rounded px-2 py-0.5 text-xs font-semibold transition-colors",
							editor && isActive(editor)
								? "bg-slate-950 text-white"
								: "text-slate-600 hover:bg-slate-200",
						)}
					>
						{label}
					</button>
				))}
			</div>

			{!editor?.getText().trim() && (
				<p className="pointer-events-none absolute translate-y-[-1px] px-3 py-2.5 text-sm text-slate-400 select-none">
					{placeholder}
				</p>
			)}

			<div className="relative">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
}

export default RichTextEditor;
