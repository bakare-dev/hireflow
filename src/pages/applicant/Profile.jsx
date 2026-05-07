import { useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { selectAuthUser } from "../../store/slices/authSlice";
import { buildParsedResume, csvToList } from "../../utils/applicant";

function Profile() {
	const user = useSelector(selectAuthUser);
	const [editing, setEditing] = useState(false);
	const [resumeFile, setResumeFile] = useState(null);
	const [profile, setProfile] = useState(() => ({
		name: user?.name ?? "",
		email: user?.email ?? "",
		location: "Lagos, NG",
		yearsOfExperience: buildParsedResume(user).yearsOfExperience,
		preferences: "Remote and hybrid roles; clear updates within one week",
		salaryExpectation: "USD 90k - 130k",
	}));
	const [parsedResume, setParsedResume] = useState(() =>
		buildParsedResume(user),
	);
	const skills = csvToList(parsedResume.skills);

	function updateProfile(field, value) {
		setProfile((current) => ({ ...current, [field]: value }));
	}

	function updateParsedResume(field, value) {
		setParsedResume((current) => ({ ...current, [field]: value }));
	}

	function saveProfile() {
		setEditing(false);
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
							{profile.email} · {profile.location}
						</p>
					</div>
					<div className="flex gap-2">
						{editing ? (
							<Button onClick={saveProfile}>Save profile</Button>
						) : null}
						<Button
							variant="secondary"
							onClick={() => setEditing((value) => !value)}
						>
							{editing ? "Cancel" : "Edit profile"}
						</Button>
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<main className="space-y-5">
					<Panel title="Resume">
						<div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
							<p className="text-sm font-semibold text-slate-950">
								{resumeFile?.name
									? "New resume selected"
									: user?.resumeUrl
										? "Resume attached"
										: "No resume attached"}
							</p>
							<p className="mt-1 text-sm text-slate-600">
								{resumeFile?.name ??
									user?.resumeUrl ??
									"This prototype uses seeded profile data until you choose a file."}
							</p>
							{editing ? (
								<input
									type="file"
									accept=".pdf,.doc,.docx"
									onChange={(e) =>
										setResumeFile(e.target.files?.[0] ?? null)
									}
									className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800"
								/>
							) : null}
						</div>
					</Panel>

					<Panel title="Basic details">
						{editing ? (
							<div className="grid gap-3 sm:grid-cols-2">
								<EditableField
									label="Name"
									value={profile.name}
									onChange={(value) => updateProfile("name", value)}
								/>
								<EditableField
									label="Email"
									value={profile.email}
									onChange={(value) => updateProfile("email", value)}
								/>
								<EditableField
									label="Location"
									value={profile.location}
									onChange={(value) => updateProfile("location", value)}
								/>
								<EditableField
									label="Years of experience"
									value={String(profile.yearsOfExperience)}
									onChange={(value) =>
										updateProfile(
											"yearsOfExperience",
											Math.max(0, Number(value) || 0),
										)
									}
								/>
								<EditableField
									label="Salary expectation"
									value={profile.salaryExpectation}
									onChange={(value) =>
										updateProfile("salaryExpectation", value)
									}
								/>
							</div>
						) : (
							<div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
								<p>Name: {profile.name}</p>
								<p>Email: {profile.email}</p>
								<p>Location: {profile.location}</p>
								<p>Experience: {profile.yearsOfExperience} years</p>
								<p>Salary: {profile.salaryExpectation}</p>
							</div>
						)}
					</Panel>

					<Panel title="Work Experience">
						{editing ? (
							<EditableArea
								label="Work experience"
								value={parsedResume.workExperience}
								onChange={(value) =>
									updateParsedResume("workExperience", value)
								}
							/>
						) : (
							<p className="whitespace-pre-line text-sm leading-6 text-slate-700">
								{parsedResume.workExperience}
							</p>
						)}
					</Panel>

					<Panel title="Skills">
						{editing ? (
							<EditableArea
								label="Skills"
								value={parsedResume.skills}
								onChange={(value) => updateParsedResume("skills", value)}
							/>
						) : (
							<div className="flex flex-wrap gap-2">
								{skills.map((skill) => (
									<Badge
										key={skill}
										className="bg-slate-50 text-slate-700 ring-slate-200"
									>
										{skill}
									</Badge>
								))}
							</div>
						)}
					</Panel>

					<Panel title="Parsed resume">
						<div className="space-y-4">
							{editing ? (
								<>
									<EditableField
										label="Years of experience"
										value={String(parsedResume.yearsOfExperience)}
										onChange={(value) =>
											updateParsedResume(
												"yearsOfExperience",
												Math.max(0, Number(value) || 0),
											)
										}
									/>
									<EditableArea
										label="Professional summary"
										value={parsedResume.professionalSummary}
										onChange={(value) =>
											updateParsedResume(
												"professionalSummary",
												value,
											)
										}
									/>
								</>
							) : (
								<div className="space-y-3 text-sm text-slate-700">
									<p className="font-medium text-slate-950">
										Parsed resume snapshot
									</p>
									<p>
										Years of experience:{" "}
										{parsedResume.yearsOfExperience}
									</p>
									<p>{parsedResume.professionalSummary}</p>
								</div>
							)}
						</div>
					</Panel>
				</main>

				<aside className="space-y-5">
					<Panel title="Preferences">
						{editing ? (
							<EditableArea
								label="Preferences"
								value={profile.preferences}
								onChange={(value) => updateProfile("preferences", value)}
							/>
						) : (
							<p className="text-sm leading-6 text-slate-700">
								{profile.preferences}
							</p>
						)}
					</Panel>
					<Panel title="Salary expectations">
						<p className="text-sm text-slate-700">
							Based on profile: {profile.salaryExpectation}
						</p>
					</Panel>
				</aside>
			</div>
		</div>
	);
}

function EditableField({ label, value, onChange }) {
	return (
		<label className="block">
			<span className="text-sm font-medium text-slate-800">{label}</span>
			<input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
			/>
		</label>
	);
}

function EditableArea({ label, value, onChange }) {
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

function Panel({ title, children }) {
	return (
		<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
			<div className="mt-4">{children}</div>
		</section>
	);
}

export default Profile;
