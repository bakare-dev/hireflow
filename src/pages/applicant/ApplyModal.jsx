import { useMemo, useState } from "react";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import useToast from "../../hooks/useToast";
import { useApplyToJobMutation } from "../../api/applicationsApi";
import { useGetJobQuery } from "../../api/jobsApi";
import { useGetResumeProfileQuery } from "../../api/resumeApi";
import {
	computeMatchPercent,
	formatSalary,
	matchSkills,
} from "../../utils/applicant";

function ApplyModal({ job: jobProp, open, onClose, existingApplication }) {
	const toast = useToast();
	const [step, setStep] = useState(0);
	const { data: resumeProfile, isLoading: isResumeLoading } =
		useGetResumeProfileQuery();
	const [applyToJob, { isLoading: submitting }] = useApplyToJobMutation();
	const { data: fetchedJob, isLoading: isJobLoading } = useGetJobQuery(
		jobProp?.id ?? "",
		{ skip: !jobProp?.id || !open },
	);
	const job = useMemo(
		() => ({ ...(jobProp ?? {}), ...(fetchedJob ?? {}) }),
		[jobProp, fetchedJob],
	);
	const jobQuestions = useMemo(
		() => (Array.isArray(job.questions) ? job.questions : []),
		[job],
	);
	const hasQuestions = jobQuestions.length > 0;
	const [answers, setAnswers] = useState({});

	function setAnswer(questionId, value) {
		setAnswers((current) => ({ ...current, [questionId]: value }));
	}

	const blockClipboard = {
		onPaste: (e) => {
			e.preventDefault();
			toast.error("Pasting is disabled — please type your answer.");
		},
		onCopy: (e) => e.preventDefault(),
		onCut: (e) => e.preventDefault(),
		onDrop: (e) => e.preventDefault(),
		onContextMenu: (e) => e.preventDefault(),
	};

	const match = useMemo(
		() => computeMatchPercent(job, resumeProfile),
		[job, resumeProfile],
	);
	const skills = useMemo(
		() => matchSkills(job, resumeProfile),
		[job, resumeProfile],
	);

	function close() {
		setStep(0);
		setAnswers({});
		onClose?.();
	}

	async function submit() {
		if (!job || existingApplication) return;
		if (!resumeProfile) {
			toast.error("Upload your resume profile before applying.");
			return;
		}
		if (hasQuestions) {
			const missing = jobQuestions.find(
				(q) => !(answers[q.id] ?? "").trim(),
			);
			if (missing) {
				toast.error("Please answer every screening question.");
				return;
			}
		}
		try {
			const payloadAnswers = hasQuestions
				? jobQuestions.map((q) => ({
						questionId: q.id,
						answer: answers[q.id].trim(),
					}))
				: undefined;
			await applyToJob(
				payloadAnswers
					? { jobId: job.id, answers: payloadAnswers }
					: job.id,
			).unwrap();
			toast.success(
				"Application submitted. We will keep the status clear.",
			);
			close();
		} catch (err) {
			toast.error(
				err?.message ?? "We could not submit this application.",
			);
		}
	}

	if (!job) return null;

	const resumeSkillNames = (resumeProfile?.skills ?? [])
		.map((s) => s.name ?? s)
		.filter(Boolean);

	const steps = [
		{
			title: "Confirm your resume",
			body: (
				<div className="space-y-4">
					{isResumeLoading || isJobLoading ? (
						<p className="text-sm text-slate-600">
							{isJobLoading
								? "Loading the latest job details…"
								: "Loading your resume profile…"}
						</p>
					) : resumeProfile ? (
						<div className="space-y-3 rounded-lg border border-slate-200 p-4">
							<div>
								<p className="text-sm font-semibold text-slate-950">
									{[
										resumeProfile.firstName,
										resumeProfile.lastName,
									]
										.filter(Boolean)
										.join(" ") ||
										resumeProfile.email ||
										"Resume on file"}
								</p>
								<p className="text-sm text-slate-600">
									{resumeProfile.email}
								</p>
							</div>
							{resumeProfile.summary ? (
								<p className="text-sm leading-6 text-slate-700">
									{resumeProfile.summary}
								</p>
							) : null}
							{resumeSkillNames.length ? (
								<div className="flex flex-wrap gap-2">
									{resumeSkillNames
										.slice(0, 12)
										.map((name) => (
											<span
												key={name}
												className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
											>
												{name}
											</span>
										))}
								</div>
							) : null}
						</div>
					) : (
						<p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
							You need a resume profile on file before applying.
							Add one in your profile and come back.
						</p>
					)}
					<div>
						<p className="text-sm font-medium text-slate-800">
							Fit for {job.title}
						</p>
						<MatchPercentBar value={match} className="mt-2" />
					</div>
				</div>
			),
		},
		...(hasQuestions
			? [
					{
						title: "Screening questions",
						body: (
							<div className="space-y-4">
								<p className="text-sm text-slate-600">
									{job.companyName ?? "The team"} would like a
									few answers from you. Please type your
									responses — pasting is disabled so the team
									hears your own words.
								</p>
								{jobQuestions.map((q, index) => (
									<div
										key={q.id ?? index}
										className="space-y-2 rounded-lg border border-slate-200 p-4"
									>
										<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
											Question {index + 1}
										</p>
										<p className="text-sm font-medium text-slate-900">
											{q.question}
										</p>
										<textarea
											value={answers[q.id] ?? ""}
											onChange={(e) =>
												setAnswer(q.id, e.target.value)
											}
											rows={4}
											maxLength={5000}
											required
											autoComplete="off"
											spellCheck={false}
											placeholder="Type your answer..."
											className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
											{...blockClipboard}
										/>
										<p className="text-right text-xs text-slate-400">
											{(answers[q.id] ?? "").length}/5000
										</p>
									</div>
								))}
							</div>
						),
					},
				]
			: []),
		{
			title: "Review and send",
			body: (
				<div className="space-y-4">
					<div>
						<p className="text-lg font-semibold text-slate-950">
							{job.title}
						</p>
						<p className="text-sm text-slate-600">
							{job.companyName ? `${job.companyName} · ` : ""}
							{job.location ?? ""}
							{job.salary ? ` · ${formatSalary(job.salary)}` : ""}
						</p>
					</div>
					<div className="grid gap-3 rounded-lg border border-slate-200 p-4 text-sm sm:grid-cols-2">
						<div>
							<p className="font-medium text-slate-950">
								Matched skills
							</p>
							<p className="mt-1 text-slate-600">
								{skills.matched.join(", ") ||
									"We will learn more from your resume."}
							</p>
						</div>
						<div>
							<p className="font-medium text-slate-950">
								May be reviewed
							</p>
							<p className="mt-1 text-slate-600">
								{skills.unmatched.join(", ") ||
									"No obvious gaps from your profile."}
							</p>
						</div>
					</div>
					<p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
						Submitting will share your resume profile with{" "}
						{job.companyName ?? "the company"} and queue AI
						screening.
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
							<Button
								variant="ghost"
								onClick={() => setStep((s) => s - 1)}
							>
								Back
							</Button>
						) : null}
						<Button
							onClick={
								step === steps.length - 1
									? submit
									: () => setStep((s) => s + 1)
							}
							disabled={
								submitting ||
								(step === 0 && !resumeProfile) ||
								(hasQuestions &&
									steps[step]?.title ===
										"Screening questions" &&
									jobQuestions.some(
										(q) => !(answers[q.id] ?? "").trim(),
									))
							}
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
					You already applied to this role. Your application status
					will stay visible across job cards and application tracking.
				</p>
			) : (
				<div>
					<div className="mb-4 flex items-center gap-2">
						{steps.map((item, idx) => (
							<span
								key={item.title}
								className={`h-1.5 flex-1 rounded-full ${
									idx <= step
										? "bg-slate-950"
										: "bg-slate-200"
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

export default ApplyModal;
