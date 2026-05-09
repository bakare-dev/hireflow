import { useEffect, useRef, useState } from "react";
import {
	useSearchSkillsQuery,
	useCreateSkillMutation,
} from "../../api/jobsApi";
import Button from "./Button";

function SkillSelector({ selectedSkills = [], onChange, label = "Skills" }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const dropdownRef = useRef(null);

	const { data: skillsData = [] } = useSearchSkillsQuery(searchQuery, {
		skip: !searchQuery || searchQuery.length < 1,
	});
	const [createSkill] = useCreateSkillMutation();

	const skills = Array.isArray(skillsData) ? skillsData : [];

	useEffect(() => {
		function handleClickOutside(e) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	async function handleCreateSkill() {
		if (!searchQuery.trim()) return;
		setIsCreating(true);
		try {
			const result = await createSkill({
				name: searchQuery.trim(),
			}).unwrap();
			if (result?.id) {
				const newSkill = {
					id: result.id,
					name: result.name || searchQuery.trim(),
				};
				onChange([...selectedSkills, newSkill]);
				setSearchQuery("");
			}
		} catch (err) {
			console.error("Failed to create skill:", err);
		} finally {
			setIsCreating(false);
		}
	}

	function handleSelectSkill(skill) {
		if (!selectedSkills.find((s) => s.id === skill.id)) {
			onChange([...selectedSkills, skill]);
		}
		setSearchQuery("");
		setIsOpen(false);
	}

	function handleRemoveSkill(skillId) {
		onChange(selectedSkills.filter((s) => s.id !== skillId));
	}

	const hasExactMatch = skills.some(
		(s) => s.name.toLowerCase() === searchQuery.toLowerCase(),
	);

	return (
		<div className="space-y-2">
			<label className="block text-sm font-medium text-slate-800">
				{label}
			</label>

			<div className="space-y-2">
				{selectedSkills.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{selectedSkills.map((skill) => (
							<div
								key={skill.id}
								className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm text-blue-900"
							>
								{skill.name}
								<button
									type="button"
									onClick={() => handleRemoveSkill(skill.id)}
									className="font-semibold hover:opacity-70"
								>
									×
								</button>
							</div>
						))}
					</div>
				)}

				<div className="relative" ref={dropdownRef}>
					<input
						type="text"
						placeholder="Search or type to add a skill..."
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							setIsOpen(true);
						}}
						onFocus={() => setIsOpen(true)}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
					/>

					{isOpen && (
						<div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-slate-200 bg-white shadow-lg">
							{searchQuery && skills.length > 0 && (
								<div className="max-h-48 overflow-y-auto">
									{skills.map((skill) => (
										<button
											key={skill.id}
											type="button"
											onClick={() =>
												handleSelectSkill(skill)
											}
											className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100"
										>
											{skill.name}
										</button>
									))}
								</div>
							)}

							{searchQuery && !hasExactMatch && (
								<div className="border-t border-slate-200 p-2">
									<Button
										type="button"
										variant="secondary"
										className="w-full text-sm"
										disabled={isCreating}
										onClick={handleCreateSkill}
									>
										{isCreating
											? "Creating..."
											: `Create "${searchQuery}"`}
									</Button>
								</div>
							)}

							{!searchQuery && (
								<div className="px-3 py-2 text-sm text-slate-500">
									Start typing to search or create a skill
								</div>
							)}

							{searchQuery &&
								skills.length === 0 &&
								hasExactMatch && (
									<div className="px-3 py-2 text-sm text-slate-500">
										Skill already exists
									</div>
								)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default SkillSelector;
