import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import useToast from "../../hooks/useToast";
import { applyToJob } from "../../store/slices/applicationsSlice";
import { selectAuthUser } from "../../store/slices/authSlice";
import {
	buildParsedResume,
	computeMatchPercent,
	csvToList,
	formatSalary,
	matchSkills,
} from "../../utils/applicant";

function ApplyModal({ job, open, onClose, existingApplication }) {
	const dispatch = useDispatch();
	const toast = useToast();
	const user = useSelector(selectAuthUser);
	const [step, setStep] = useState(0);
	const [parsedResume, setParsedResume] = useState(() =>
		buildParsedResume(user),
	);
	const [resumeFile, setResumeFile] = useState(null);
	const [coverLetterFile, setCoverLetterFile] = useState(null);
	const [note, setNote] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const match = useMemo(() => computeMatchPercent(job, user), [job, user]);
	const skills = useMemo(() => matchSkills(job, user), [job, user]);

	function close() {
		setStep(0);
		setParsedResume(buildParsedResume(user));
		setResumeFile(null);
		setCoverLetterFile(null);
		setNote("");
		onClose?.();
	}

	function updateParsedResume(field, value) {
		setParsedResume((current) => ({ ...current, [field]: value }));
	}

	async function submit() {
		if (!job || !user || existingApplication) return;
		setSubmitting(true);
		const action = await dispatch(
			applyToJob({ applicantId: user.id, jobListingId: job.id }),
		);
		setSubmitting(false);

		if (applyToJob.fulfilled.match(action)) {
			toast.success("Application submitted. We will keep the status clear.");
			close();
		} else {
			toast.error(
				action.payload?.message ?? "We could not submit this application.",
			);
		}
	}

	if (!job) return null;

	const steps = [
		{
			title: "Resume ready",
			body: (
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<label className="block rounded-lg border border-slate-200 bg-slate-50 p-4">
							<span className="text-sm font-semibold text-slate-950">
								Resume
							</span>
							<span className="mt-1 block text-sm text-slate-600">
								{resumeFile?.name ?? user?.resumeUrl ?? "Upload a resume"}
							</span>
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								onChange={(e) =>
									setResumeFile(e.target.files?.[0] ?? null)
								}
								className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800"
							/>
						</label>
						<label className="block rounded-lg border border-slate-200 bg-slate-50 p-4">
							<span className="text-sm font-semibold text-slate-950">
								Cover letter
							</span>
							<span className="mt-1 block text-sm text-slate-600">
								{coverLetterFile?.name ?? "Optional upload"}
							</span>
							<input
								type="file"
								accept=".pdf,.doc,.docx,.txt"
								onChange={(e) =>
									setCoverLetterFile(e.target.files?.[0] ?? null)
								}
								className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-800"
							/>
						</label>
					</div>
					<div>
						<p className="text-sm font-medium text-slate-800">
							Fit for {job.title}
						</p>
						<MatchPercentBar value={match} className="mt-2" />
					</div>
				</div>
			),
		},
		{
			title: "Review parsed resume",
			body: (
				<div className="space-y-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<ParsedField
							label="Name"
							value={parsedResume.name}
							onChange={(value) => updateParsedResume("name", value)}
						/>
						<ParsedField
							label="Email"
							value={parsedResume.email}
							onChange={(value) => updateParsedResume("email", value)}
						/>
					</div>
					<ParsedField
						label="Years of experience"
						value={String(parsedResume.yearsOfExperience ?? 0)}
						onChange={(value) =>
							updateParsedResume(
								"yearsOfExperience",
								Math.max(0, Number(value) || 0),
							)
						}
					/>
					<ParsedArea
						label="Professional summary"
						value={parsedResume.professionalSummary}
						onChange={(value) =>
							updateParsedResume("professionalSummary", value)
						}
					/>
					<ParsedArea
						label="Skills (comma separated)"
						value={parsedResume.skills}
						onChange={(value) => updateParsedResume("skills", value)}
					/>
					<ParsedArea
						label="Work experience"
						value={parsedResume.workExperience}
						onChange={(value) =>
							updateParsedResume("workExperience", value)
						}
					/>
					<label className="block">
						<span className="text-sm font-medium text-slate-800">
							Short note
						</span>
						<textarea
							value={note}
							onChange={(e) => setNote(e.target.value)}
							rows={4}
							placeholder="Optional note to the hiring team"
							className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
						/>
					</label>
				</div>
			),
		},
		{
			title: "Review and send",
			body: (
				<div className="space-y-4">
					<div>
						<p className="text-lg font-semibold text-slate-950">{job.title}</p>
						<p className="text-sm text-slate-600">
							{job.location} · {formatSalary(job.salary)}
						</p>
					</div>
					<div className="grid gap-3 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-2">
						<div>
							<p className="font-medium text-slate-950">
								Years of experience
							</p>
							<p className="mt-1 text-slate-600">
								{parsedResume.yearsOfExperience} years
							</p>
						</div>
						<div>
							<p className="font-medium text-slate-950">Uploads</p>
							<p className="mt-1 text-slate-600">
								Resume: {resumeFile?.name ?? "seeded profile"}; Cover letter:{" "}
								{coverLetterFile?.name ?? "not attached"}
							</p>
						</div>
					</div>
					<div className="rounded-lg border border-slate-200 p-4">
						<p className="text-sm font-semibold text-slate-950">
							Professional summary
						</p>
						<p className="mt-2 text-sm leading-6 text-slate-700">
							{parsedResume.professionalSummary}
						</p>
					</div>
					<div className="rounded-lg border border-slate-200 p-4">
						<p className="text-sm font-semibold text-slate-950">Skills</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{csvToList(parsedResume.skills).map((skill) => (
								<span
									key={skill}
									className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
								>
									{skill}
								</span>
							))}
						</div>
					</div>
					<div className="rounded-lg border border-slate-200 p-4">
						<p className="text-sm font-semibold text-slate-950">
							Work experience
						</p>
						<p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
							{parsedResume.workExperience}
						</p>
					</div>
					<div className="grid gap-3 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-2">
						<div>
							<p className="font-medium text-slate-950">Matched skills</p>
							<p className="mt-1 text-slate-600">
								{skills.matched.join(", ") ||
									"We will learn more from your resume."}
							</p>
						</div>
						<div>
							<p className="font-medium text-slate-950">May be reviewed</p>
							<p className="mt-1 text-slate-600">
								{skills.unmatched.join(", ") ||
									"No obvious gaps from your profile."}
							</p>
						</div>
					</div>
					<p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
						This dummy flow uses your seeded profile and submits through the
						in-memory application service.
					</p>
				</div>
			),
		},
	];

	return (
		<Modal
			open={open}
			onClose={close}
			title={existingApplication ? "Already applied" : "Quick apply"}
			size="lg"
			footer={
				existingApplication ? (
					<Button variant="secondary" onClick={close}>
						Close
					</Button>
				) : (
					<>
						{step > 0 ? (
							<Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
								Back
							</Button>
						) : null}
						<Button
							onClick={
								step === steps.length - 1
									? submit
									: () => setStep((s) => s + 1)
							}
							disabled={submitting}
						>
							{step === steps.length - 1
								? submitting
									? "Submitting..."
									: "Submit application"
								: "Continue"}
						</Button>
					</>
				)
			}
		>
			{existingApplication ? (
				<p className="text-sm text-slate-600">
					You already applied to this role. Your application status will stay
					visible across job cards and application tracking.
				</p>
			) : (
				<div>
					<div className="mb-4 flex items-center gap-2">
						{steps.map((item, idx) => (
							<span
								key={item.title}
								className={`h-1.5 flex-1 rounded-full ${
									idx <= step ? "bg-slate-950" : "bg-slate-200"
								}`}
							/>
						))}
					</div>
					<h3 className="text-lg font-semibold text-slate-950">
						{steps[step].title}
					</h3>
					<div className="mt-4">{steps[step].body}</div>
				</div>
			)}
		</Modal>
	);
}

function ParsedField({ label, value, onChange }) {
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

function ParsedArea({ label, value, onChange }) {
	return (
		<label className="block">
			<span className="text-sm font-medium text-slate-800">{label}</span>
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				rows={3}
				className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
			/>
		</label>
	);
}

export default ApplyModal;
