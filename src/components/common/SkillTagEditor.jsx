import { useRef, useState } from "react";
import { cn } from "../../utils/classnames";

function SkillTagEditor({ skills = [], onChange }) {
	const [input, setInput] = useState("");
	const inputRef = useRef(null);

	function addSkill(raw) {
		const tag = raw.trim();
		if (!tag || skills.includes(tag)) return;
		onChange([...skills, tag]);
	}

	function removeSkill(tag) {
		onChange(skills.filter((s) => s !== tag));
	}

	function handleKeyDown(e) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addSkill(input);
			setInput("");
			return;
		}
		if (e.key === "Backspace" && input === "" && skills.length > 0) {
			onChange(skills.slice(0, -1));
		}
	}

	function handleBlur() {
		if (input.trim()) {
			addSkill(input);
			setInput("");
		}
	}

	return (
		<div
			onClick={() => inputRef.current?.focus()}
			className={cn(
				"flex min-h-[42px] cursor-text flex-wrap gap-1.5 rounded-md border border-slate-200 px-2.5 py-2",
				"focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-200",
			)}
		>
			{skills.map((skill) => (
				<span
					key={skill}
					className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
				>
					{skill}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							removeSkill(skill);
						}}
						className="text-slate-400 transition-colors hover:text-slate-700"
						aria-label={`Remove ${skill}`}
					>
						×
					</button>
				</span>
			))}
			<input
				ref={inputRef}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				placeholder={skills.length === 0 ? "Type a skill and press Enter…" : ""}
				className="min-w-[140px] flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
			/>
		</div>
	);
}

export default SkillTagEditor;
