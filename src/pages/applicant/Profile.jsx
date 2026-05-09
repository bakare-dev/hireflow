import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";
import RichTextEditor from "../../components/common/RichTextEditor";
import SkillTagEditor from "../../components/common/SkillTagEditor";
import Spinner from "../../components/common/Spinner";
import { selectAuthUser } from "../../store/slices/authSlice";
import { parseResume } from "../../utils/resumeParser";
import { cn } from "../../utils/classnames";

function buildProfile(user) {
	return {
		name: user?.name ?? "",
		email: user?.email ?? "",
		location: "",
		yearsOfExperience: "",
		salaryExpectation: "",
		preferences: "",
	};
}

function buildResumeData(user) {
	return {
		phoneNumber: "",
		email: user?.email ?? "",
		linkedIn: "",
		summary: "",
		skills: user?.skills ?? [],
		jobExperience: [],
	};
}

function Profile() {
	const user = useSelector(selectAuthUser);
	const [tab, setTab] = useState("profile");
	const [editing, setEditing] = useState(false);
	const [isParsing, setIsParsing] = useState(false);
	const [parseError, setParseError] = useState(null);
	const fileRef = useRef(null);

	const [profile, setProfile] = useState(() => buildProfile(user));
	const [resumeData, setResumeData] = useState(() => buildResumeData(user));

	function updateProfile(field, value) {
		setProfile((p) => ({ ...p, [field]: value }));
	}

	function updateResume(field, value) {
		setResumeData((r) => ({ ...r, [field]: value }));
	}

	function updateExperience(id, field, value) {
		setResumeData((r) => ({
			...r,
			jobExperience: r.jobExperience.map((e) =>
				e.id === id ? { ...e, [field]: value } : e,
			),
		}));
	}

	function addExperience() {
		setResumeData((r) => ({
			...r,
			jobExperience: [
				...r.jobExperience,
				{
					id: crypto.randomUUID(),
					companyName: "",
					jobTitle: "",
					startDate: "",
					endDate: "",
					experience: "<p></p>",
				},
			],
		}));
	}

	function removeExperience(id) {
		setResumeData((r) => ({
			...r,
			jobExperience: r.jobExperience.filter((e) => e.id !== id),
		}));
	}

	async function handleUpload(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		setIsParsing(true);
		setParseError(null);
		try {
			const parsed = await parseResume(file);
			setResumeData(parsed);
			setTab("resume");
		} catch {
			setParseError("Could not parse the PDF. Please check the file and try again.");
		} finally {
			setIsParsing(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-medium text-slate-500">Profile</p>
						<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
							{profile.name || "Your profile"}
						</h1>
						<p className="mt-2 text-sm text-slate-600">
							{profile.email}
							{profile.location ? ` · ${profile.location}` : ""}
						</p>
					</div>

					<div className="flex items-center gap-3">
						{isParsing && (
							<span className="flex items-center gap-1.5 text-sm text-slate-500">
								<Spinner className="h-4 w-4" /> Parsing…
							</span>
						)}
						<Button
							variant="secondary"
							size="sm"
							disabled={isParsing}
							onClick={() => fileRef.current?.click()}
						>
							{resumeData.jobExperience.length > 0
								? "Re-upload resume"
								: "Upload resume (PDF)"}
						</Button>
						<input
							ref={fileRef}
							type="file"
							accept=".pdf"
							onChange={handleUpload}
							className="hidden"
						/>
					</div>
				</div>

				{parseError && (
					<p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
						{parseError}
					</p>
				)}

				<div className="mt-5 flex border-b border-slate-200">
					{["profile", "resume"].map((t) => (
						<button
							key={t}
							onClick={() => setTab(t)}
							className={cn(
								"px-4 py-2.5 text-sm font-medium capitalize transition-colors",
								tab === t
									? "border-b-2 border-slate-950 text-slate-950"
									: "text-slate-500 hover:text-slate-700",
							)}
						>
							{t}
						</button>
					))}
				</div>
			</section>

			{tab === "profile" && (
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
					<main className="space-y-5">
						<Panel
							title="Basic details"
							action={
								editing ? (
									<div className="flex gap-2">
										<Button size="sm" onClick={() => setEditing(false)}>
											Save
										</Button>
										<Button
											size="sm"
											variant="secondary"
											onClick={() => setEditing(false)}
										>
											Cancel
										</Button>
									</div>
								) : (
									<Button
										size="sm"
										variant="secondary"
										onClick={() => setEditing(true)}
									>
										Edit
									</Button>
								)
							}
						>
							{editing ? (
								<div className="grid gap-3 sm:grid-cols-2">
									<Field
										label="Full name"
										value={profile.name}
										onChange={(v) => updateProfile("name", v)}
									/>
									<Field
										label="Email"
										value={profile.email}
										onChange={(v) => updateProfile("email", v)}
									/>
									<Field
										label="Location"
										value={profile.location}
										onChange={(v) => updateProfile("location", v)}
									/>
									<Field
										label="Years of experience"
										value={profile.yearsOfExperience}
										onChange={(v) => updateProfile("yearsOfExperience", v)}
									/>
								</div>
							) : (
								<dl className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
									<Detail label="Name" value={profile.name || "—"} />
									<Detail label="Email" value={profile.email || "—"} />
									<Detail label="Location" value={profile.location || "—"} />
									<Detail
										label="Experience"
										value={
											profile.yearsOfExperience
												? `${profile.yearsOfExperience} years`
												: "—"
										}
									/>
								</dl>
							)}
						</Panel>
					</main>

					<aside className="space-y-5">
						<Panel title="Preferences">
							{editing ? (
								<AreaField
									label="Preferences"
									value={profile.preferences}
									onChange={(v) => updateProfile("preferences", v)}
								/>
							) : (
								<p className="text-sm leading-6 text-slate-700">
									{profile.preferences || "—"}
								</p>
							)}
						</Panel>

						<Panel title="Salary expectation">
							{editing ? (
								<Field
									label="Salary expectation"
									value={profile.salaryExpectation}
									onChange={(v) => updateProfile("salaryExpectation", v)}
								/>
							) : (
								<p className="text-sm text-slate-700">
									{profile.salaryExpectation || "—"}
								</p>
							)}
						</Panel>
					</aside>
				</div>
			)}

			{tab === "resume" && (
				<div className="space-y-5">
					{resumeData.jobExperience.length === 0 &&
						!resumeData.summary &&
						resumeData.skills.length === 0 && (
							<div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
								<p className="text-sm font-medium text-slate-600">
									No resume data yet
								</p>
								<p className="mt-1 text-sm text-slate-500">
									Upload a PDF to auto-fill this section, or add details manually below.
								</p>
							</div>
						)}

					<Panel title="Contact info">
						<div className="grid gap-3 sm:grid-cols-2">
							<Field
								label="Phone number"
								value={resumeData.phoneNumber}
								onChange={(v) => updateResume("phoneNumber", v)}
							/>
							<Field
								label="Email"
								value={resumeData.email}
								onChange={(v) => updateResume("email", v)}
							/>
							<Field
								label="LinkedIn URL"
								value={resumeData.linkedIn}
								onChange={(v) => updateResume("linkedIn", v)}
								className="sm:col-span-2"
							/>
						</div>
					</Panel>

					<Panel title="Summary">
						<AreaField
							label="Professional summary"
							value={resumeData.summary}
							onChange={(v) => updateResume("summary", v)}
						/>
					</Panel>

					<Panel title="Skills">
						<p className="mb-2 text-xs text-slate-500">
							Type a skill and press Enter or comma to add. Backspace removes the last tag.
						</p>
						<SkillTagEditor
							skills={resumeData.skills}
							onChange={(skills) => updateResume("skills", skills)}
						/>
					</Panel>

					<Panel
						title="Job experience"
						action={
							<Button size="sm" variant="secondary" onClick={addExperience}>
								+ Add entry
							</Button>
						}
					>
						{resumeData.jobExperience.length === 0 ? (
							<p className="text-sm text-slate-500">
								No entries yet. Click "+ Add entry" or upload a resume.
							</p>
						) : (
							<div className="space-y-6">
								{resumeData.jobExperience.map((entry, idx) => (
									<ExperienceEntry
										key={entry.id}
										entry={entry}
										index={idx}
										onChange={(field, value) =>
											updateExperience(entry.id, field, value)
										}
										onRemove={() => removeExperience(entry.id)}
									/>
								))}
							</div>
						)}
					</Panel>

					<div className="flex justify-end">
						<Button>Save resume</Button>
					</div>
				</div>
			)}
		</div>
	);
}

function ExperienceEntry({ entry, index, onChange, onRemove }) {
	return (
		<div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
			<div className="flex items-center justify-between">
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					Entry {index + 1}
				</p>
				<button
					type="button"
					onClick={onRemove}
					className="text-xs text-rose-500 hover:text-rose-700"
				>
					Remove
				</button>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<Field
					label="Company name"
					value={entry.companyName}
					onChange={(v) => onChange("companyName", v)}
				/>
				<Field
					label="Job title"
					value={entry.jobTitle}
					onChange={(v) => onChange("jobTitle", v)}
				/>
				<Field
					label="Start date"
					placeholder="e.g. 2022-03"
					value={entry.startDate}
					onChange={(v) => onChange("startDate", v)}
				/>
				<Field
					label="End date"
					placeholder="e.g. 2024-01 or Present"
					value={entry.endDate}
					onChange={(v) => onChange("endDate", v)}
				/>
			</div>

			<div>
				<p className="mb-1.5 text-sm font-medium text-slate-800">Description</p>
				<RichTextEditor
					value={entry.experience}
					onChange={(v) => onChange("experience", v)}
					placeholder="Describe your responsibilities and achievements…"
				/>
			</div>
		</div>
	);
}

function Panel({ title, action, children }) {
	return (
		<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
				{action}
			</div>
			<div className="mt-4">{children}</div>
		</section>
	);
}

function Field({ label, value, onChange, placeholder, className }) {
	return (
		<label className={cn("block", className)}>
			<span className="text-sm font-medium text-slate-800">{label}</span>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
			/>
		</label>
	);
}

function AreaField({ label, value, onChange }) {
	return (
		<label className="block">
			<span className="text-sm font-medium text-slate-800">{label}</span>
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				rows={4}
				className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
			/>
		</label>
	);
}

function Detail({ label, value }) {
	return (
		<p>
			<span className="font-medium text-slate-950">{label}:</span> {value}
		</p>
	);
}

export default Profile;
