import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import RichTextViewer from "../../components/editor/RichTextViewer";
import { ROUTES } from "../../constants/routes";
import {
	STAGE_BADGE_COLORS,
	STAGE_LABELS,
	STAGE_TARGET_OPTIONS,
} from "../../constants/stages";
import {
	useGetMyApplicationQuery,
	useUpdateApplicationStageMutation,
} from "../../api/applicationsApi";
import {
	useCancelInterviewMutation,
	useGetInterviewQuery,
	useRescheduleInterviewMutation,
	useScheduleInterviewMutation,
} from "../../api/interviewsApi";
import {
	useGetScorecardsForSlotQuery,
	useListScorecardTemplatesQuery,
	useSubmitScorecardMutation,
} from "../../api/scorecardsApi";
import useToast from "../../hooks/useToast";
import { USER_ROLES } from "../../constants/roles";
import { selectAuthUser } from "../../store/slices/authSlice";

const SEVERITY_STYLES = {
	HIGH: "bg-rose-100 text-rose-700 ring-rose-200",
	MEDIUM: "bg-amber-100 text-amber-700 ring-amber-200",
	LOW: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

function JobApplicationDetailPage() {
	const { id: jobId, applicationId } = useParams();
	const {
		data: application,
		isLoading,
		isError,
		error,
	} = useGetMyApplicationQuery(applicationId ?? "", {
		skip: !applicationId,
	});
	const toast = useToast();
	const [resumeOpen, setResumeOpen] = useState(false);
	const [activeStage, setActiveStage] = useState(1);
	const [stageModalOpen, setStageModalOpen] = useState(false);
	const [scheduleOpen, setScheduleOpen] = useState(false);
	const [rescheduleOpen, setRescheduleOpen] = useState(false);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [scorecardOpen, setScorecardOpen] = useState(false);

	const [updateStage, { isLoading: isUpdatingStage }] =
		useUpdateApplicationStageMutation();
	const [scheduleInterview, { isLoading: isScheduling }] =
		useScheduleInterviewMutation();
	const [rescheduleInterview, { isLoading: isRescheduling }] =
		useRescheduleInterviewMutation();
	const [cancelInterview, { isLoading: isCancelling }] =
		useCancelInterviewMutation();
	const [submitScorecard, { isLoading: isSubmittingScorecard }] =
		useSubmitScorecardMutation();

	const inlinedInterviewSlot = useMemo(() => {
		if (!application) return null;
		return (
			application.interviewSlot ??
			application.interviewSlots?.find(
				(s) => s?.status === "SCHEDULED",
			) ??
			application.interviewSlots?.[
				application.interviewSlots.length - 1
			] ??
			null
		);
	}, [application]);

	const shouldFetchInterview =
		!!applicationId &&
		!inlinedInterviewSlot &&
		application?.stage === "INTERVIEW_SCHEDULED";
	const { data: fetchedInterview } = useGetInterviewQuery(
		applicationId ?? "",
		{ skip: !shouldFetchInterview },
	);
	const interviewSlot = inlinedInterviewSlot ?? fetchedInterview ?? null;
	const slotId = interviewSlot?.id ?? null;

	const inlinedScorecards = useMemo(() => {
		if (!application) return null;
		if (Array.isArray(application.scorecards)) {
			return application.scorecards;
		}
		if (Array.isArray(interviewSlot?.scorecards)) {
			return interviewSlot.scorecards;
		}
		const legacy = application.scorecard ?? interviewSlot?.scorecard;
		if (legacy) return [legacy];
		return null;
	}, [application, interviewSlot]);

	const { data: fetchedScorecardsRaw } = useGetScorecardsForSlotQuery(
		slotId ?? "",
		{ skip: !slotId || inlinedScorecards !== null },
	);
	const scorecards = useMemo(() => {
		if (inlinedScorecards) return inlinedScorecards;
		const raw = fetchedScorecardsRaw;
		if (Array.isArray(raw)) return raw;
		if (Array.isArray(raw?.data)) return raw.data;
		if (Array.isArray(raw?.content)) return raw.content;
		return [];
	}, [inlinedScorecards, fetchedScorecardsRaw]);

	const authUser = useSelector(selectAuthUser);
	const isHrManager = authUser?.role === USER_ROLES.HIRING_MANAGER;
	const currentUserSubmitted = scorecards.some(
		(s) =>
			s?.submittedById === authUser?.id ||
			(s?.submittedByEmail &&
				authUser?.email &&
				s.submittedByEmail.toLowerCase() ===
					authUser.email.toLowerCase()),
	);

	async function handleStageSubmit({ targetStage, reason }) {
		try {
			await updateStage({
				id: applicationId,
				targetStage,
				reason: reason?.trim() || undefined,
			}).unwrap();
			toast.success("Stage updated.");
			setStageModalOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ?? err.error ?? "Unable to update the stage.",
			);
		}
	}

	async function handleScheduleSubmit(payload) {
		try {
			await scheduleInterview({
				applicationId,
				...payload,
			}).unwrap();
			toast.success("Interview scheduled.");
			setScheduleOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to schedule the interview.",
			);
		}
	}

	async function handleRescheduleSubmit(payload) {
		try {
			await rescheduleInterview({
				applicationId,
				...payload,
			}).unwrap();
			toast.success("Interview rescheduled.");
			setRescheduleOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to reschedule the interview.",
			);
		}
	}

	async function handleCancelSubmit(reason) {
		try {
			await cancelInterview({ applicationId, reason }).unwrap();
			toast.success("Interview cancelled.");
			setCancelOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to cancel the interview.",
			);
		}
	}

	async function handleScorecardSubmit({ interviewSlotId, ...payload }) {
		try {
			await submitScorecard({
				interviewSlotId,
				applicationId,
				...payload,
			}).unwrap();
			toast.success("Scorecard submitted.");
			setScorecardOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to submit the scorecard.",
			);
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<PageHeader
					title="Loading application"
					description="Fetching the candidate's screening details..."
				/>
			</div>
		);
	}

	if (isError || !application) {
		return (
			<div className="space-y-4">
				<PageHeader
					title="Application not found"
					description={
						error?.data?.message ??
						"This application may have been removed or is unavailable."
					}
				/>
				<Link
					to={ROUTES.JOB_APPLICATIONS(jobId)}
					className="text-sm text-slate-600 underline"
				>
					Back to applications
				</Link>
			</div>
		);
	}

	const {
		stage,
		applicantName,
		applicantEmail,
		jobTitle,
		companyName,
		resumeProfile,
		screeningResult,
		stageUpdates = [],
		answers = [],
		createdAt,
	} = application;

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow={companyName ?? "Application"}
				title={applicantName ?? "Applicant"}
				description={`${applicantEmail ?? ""}${
					jobTitle ? ` · Applied for ${jobTitle}` : ""
				}`}
				actions={
					<div className="flex items-center gap-2">
						<Link to={ROUTES.JOB_APPLICATIONS(jobId)}>
							<Button size="sm" variant="ghost">
								← Back to applications
							</Button>
						</Link>
						<Button
							size="sm"
							onClick={() => setStageModalOpen(true)}
						>
							Update stage
						</Button>
					</div>
				}
			/>

			<Card>
				<CardBody className="grid gap-4 sm:grid-cols-3">
					<Metric
						title="Current stage"
						value={
							<Badge
								className={
									STAGE_BADGE_COLORS[stage] ??
									"bg-slate-100 text-slate-700 ring-slate-200"
								}
							>
								{STAGE_LABELS[stage] ?? stage}
							</Badge>
						}
					/>
					<Metric
						title="Submitted"
						value={
							createdAt
								? new Date(createdAt).toLocaleString()
								: "—"
						}
					/>
					<Metric
						title="Match"
						value={
							screeningResult?.matchPercentage != null
								? `${screeningResult.matchPercentage}%`
								: "Pending"
						}
					/>
				</CardBody>
			</Card>

			<div
				role="note"
				className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
			>
				<svg
					aria-hidden
					viewBox="0 0 20 20"
					fill="currentColor"
					className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
				>
					<path
						fillRule="evenodd"
						d="M8.485 2.495c.69-1.327 2.34-1.327 3.03 0l6.28 12.062c.643 1.235-.243 2.693-1.515 2.693H3.72c-1.272 0-2.158-1.458-1.515-2.693L8.485 2.495zM10 7a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 7zm0 8a1 1 0 100-2 1 1 0 000 2z"
						clipRule="evenodd"
					/>
				</svg>
				<div>
					<p className="font-semibold">
						AI screening is a signal, not a verdict.
					</p>
					<p className="mt-0.5 text-amber-800">
						Match scores, narrative summaries, and inconsistency
						flags are model-generated and can be wrong. Always read
						the candidate's resume and screening answers below
						before advancing or rejecting.
					</p>
				</div>
			</div>

			{screeningResult ? (
				<ScreeningPanel
					activeStage={activeStage}
					onSelectStage={setActiveStage}
					stages={[
						{
							number: 1,
							title: "Resume Matching",
							description:
								"How the applicant's resume lines up with the job's required skills.",
							render: () => (
								<>
									<div className="grid gap-4 sm:grid-cols-3">
										<Stat
											label="Match percentage"
											value={
												screeningResult.matchPercentage !=
												null
													? `${screeningResult.matchPercentage}%`
													: "—"
											}
										/>
										<TagList
											label="Matched skills"
											items={
												screeningResult.matchedSkills
											}
											tone="positive"
										/>
										<TagList
											label="Unmatched skills"
											items={
												screeningResult.unmatchedSkills
											}
											tone="negative"
										/>
									</div>
									<Detail
										label="AI narrative summary"
										value={
											screeningResult.aiNarrativeSummary
										}
									/>
								</>
							),
						},
						{
							number: 2,
							title: "Resume Analysis",
							description:
								"AI's structured read of the resume itself.",
							render: () => (
								<ScoreBlock
									signal={screeningResult.resumeAnalysis}
								/>
							),
						},
						{
							number: 3,
							title: "Project Consistency",
							description:
								"Whether the listed projects align with the claimed experience.",
							render: () => (
								<ScoreBlock
									signal={screeningResult.projectConsistency}
								/>
							),
						},
						{
							number: 4,
							title: "Inconsistency Review",
							description:
								"Risk flags raised by comparing answers, skills, and resume evidence.",
							headerExtra:
								screeningResult.inconsistencySeverity ? (
									<Badge
										className={
											SEVERITY_STYLES[
												screeningResult
													.inconsistencySeverity
											] ??
											"bg-slate-100 text-slate-700 ring-slate-200"
										}
									>
										Severity:{" "}
										{screeningResult.inconsistencySeverity}
									</Badge>
								) : null,
							render: () => (
								<>
									<div className="grid gap-4 sm:grid-cols-3">
										<Stat
											label="Review score"
											value={
												screeningResult
													.inconsistencyReview
													?.score != null
													? `${screeningResult.inconsistencyReview.score}`
													: "—"
											}
										/>
									</div>
									<Detail
										label="Explanation"
										value={
											screeningResult.inconsistencyReview
												?.explanation
										}
									/>
									<Detail
										label="Review notes"
										value={
											screeningResult.inconsistencyReview
												?.review
										}
									/>
									<Detail
										label="Recommended action"
										value={
											screeningResult.recommendedHumanReviewAction
										}
									/>
								</>
							),
						},
					]}
				/>
			) : (
				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Screening Result
						</h2>
					</CardHeader>
					<CardBody>
						<EmptyState
							title="Screening not ready"
							description="The AI screening for this application has not produced results yet."
						/>
					</CardBody>
				</Card>
			)}

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						Screening Q&amp;A
					</h2>
				</CardHeader>
				<CardBody>
					{answers.length ? (
						<ol className="space-y-3">
							{answers.map((a, index) => (
								<li
									key={a.id ?? index}
									className="rounded-md border border-slate-200 p-3"
								>
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Question {index + 1}
									</p>
									<p className="mt-1 text-sm font-medium text-slate-900">
										{a.question}
									</p>
									<p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
										{a.answer}
									</p>
								</li>
							))}
						</ol>
					) : (
						<p className="text-sm text-slate-500">
							The applicant did not provide screening answers.
						</p>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<h2 className="text-sm font-semibold text-slate-900">
							Resume
						</h2>
						{resumeProfile ? (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => setResumeOpen(true)}
							>
								View resume
							</Button>
						) : null}
					</div>
				</CardHeader>
				<CardBody>
					{resumeProfile ? (
						<p className="text-sm text-slate-600">
							{[resumeProfile.firstName, resumeProfile.lastName]
								.filter(Boolean)
								.join(" ") ||
								resumeProfile.email ||
								"Applicant"}{" "}
							· {resumeProfile.skills?.length ?? 0} skills ·{" "}
							{resumeProfile.workExperiences?.length ?? 0} roles
						</p>
					) : (
						<p className="text-sm text-slate-500">
							The applicant has not uploaded a resume profile.
						</p>
					)}
				</CardBody>
			</Card>

			<Modal
				open={resumeOpen}
				onClose={() => setResumeOpen(false)}
				title="Resume"
				size="lg"
				footer={
					<Button
						variant="secondary"
						onClick={() => setResumeOpen(false)}
					>
						Close
					</Button>
				}
			>
				{resumeProfile ? (
					<ResumeProfile profile={resumeProfile} />
				) : null}
			</Modal>

			<InterviewSection
				stage={stage}
				slot={interviewSlot}
				onSchedule={() => setScheduleOpen(true)}
				onReschedule={() => setRescheduleOpen(true)}
				onCancel={() => setCancelOpen(true)}
			/>

			<ScorecardSection
				slot={interviewSlot}
				scorecards={scorecards}
				canSubmit={
					isHrManager &&
					interviewSlot &&
					interviewSlot.status !== "CANCELLED" &&
					!currentUserSubmitted
				}
				isHrManager={isHrManager}
				alreadySubmitted={currentUserSubmitted}
				onSubmit={() => setScorecardOpen(true)}
			/>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						Stage history
					</h2>
				</CardHeader>
				<CardBody>
					{stageUpdates.length ? (
						<ol className="space-y-2">
							{[...stageUpdates]
								.sort(
									(a, b) =>
										new Date(a.createdAt) -
										new Date(b.createdAt),
								)
								.map((su) => (
									<li
										key={su.id}
										className="flex items-start justify-between gap-3 rounded-md border border-slate-100 px-3 py-2 text-sm"
									>
										<div>
											<p className="font-medium text-slate-900">
												{su.previousStage
													? `${
															STAGE_LABELS[
																su.previousStage
															] ??
															su.previousStage
														} → ${
															STAGE_LABELS[
																su.currentStage
															] ?? su.currentStage
														}`
													: (STAGE_LABELS[
															su.currentStage
														] ?? su.currentStage)}
											</p>
											<p className="text-xs text-slate-500">
												{su.reason} · {su.actor}
											</p>
										</div>
										<span className="text-xs text-slate-500">
											{su.createdAt
												? new Date(
														su.createdAt,
													).toLocaleString()
												: ""}
										</span>
									</li>
								))}
						</ol>
					) : (
						<p className="text-sm text-slate-500">
							No stage transitions recorded yet.
						</p>
					)}
				</CardBody>
			</Card>

			{stageModalOpen ? (
				<UpdateStageModal
					open
					currentStage={stage}
					scorecardCount={scorecards.length}
					submitting={isUpdatingStage}
					onClose={() => setStageModalOpen(false)}
					onSubmit={handleStageSubmit}
				/>
			) : null}

			{scheduleOpen ? (
				<InterviewModal
					open
					title="Schedule interview"
					submitLabel="Schedule"
					submitting={isScheduling}
					onClose={() => setScheduleOpen(false)}
					onSubmit={handleScheduleSubmit}
				/>
			) : null}

			{rescheduleOpen && interviewSlot ? (
				<InterviewModal
					open
					title="Reschedule interview"
					submitLabel="Save changes"
					submitting={isRescheduling}
					initial={interviewSlot}
					onClose={() => setRescheduleOpen(false)}
					onSubmit={handleRescheduleSubmit}
				/>
			) : null}

			{cancelOpen ? (
				<CancelInterviewModal
					open
					submitting={isCancelling}
					onClose={() => setCancelOpen(false)}
					onSubmit={handleCancelSubmit}
				/>
			) : null}

			{scorecardOpen && interviewSlot ? (
				<SubmitScorecardModal
					open
					slot={interviewSlot}
					submitting={isSubmittingScorecard}
					onClose={() => setScorecardOpen(false)}
					onSubmit={handleScorecardSubmit}
				/>
			) : null}
		</div>
	);
}

function UpdateStageModal({
	open,
	currentStage,
	scorecardCount = 0,
	submitting,
	onClose,
	onSubmit,
}) {
	const [targetStage, setTargetStage] = useState("");
	const [reason, setReason] = useState("");

	const reasonRequired = targetStage === "REJECTED";
	const blocksOfferWithoutScorecard =
		targetStage === "OFFER_SENT" &&
		currentStage === "INTERVIEW_SCHEDULED" &&
		scorecardCount === 0;

	function handleSubmit(event) {
		event.preventDefault();
		if (!targetStage) return;
		if (reasonRequired && !reason.trim()) return;
		if (blocksOfferWithoutScorecard) return;
		onSubmit?.({ targetStage, reason });
	}

	const submitDisabled =
		submitting ||
		!targetStage ||
		(reasonRequired && !reason.trim()) ||
		blocksOfferWithoutScorecard;

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Update application stage"
			size="sm"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={submitDisabled}>
						{submitting ? "Updating…" : "Update stage"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3">
				{currentStage ? (
					<div className="flex items-center gap-2 text-sm text-slate-600">
						<span>Current stage:</span>
						<Badge
							className={
								STAGE_BADGE_COLORS[currentStage] ??
								"bg-slate-100 text-slate-700 ring-slate-200"
							}
						>
							{STAGE_LABELS[currentStage] ?? currentStage}
						</Badge>
					</div>
				) : null}
				<Select
					label="Target stage"
					value={targetStage}
					onChange={(e) => setTargetStage(e.target.value)}
					options={[
						{ value: "", label: "Select a stage…" },
						...STAGE_TARGET_OPTIONS.filter(
							(opt) => opt.value !== currentStage,
						),
					]}
				/>
				<p className="text-xs text-slate-500">
					To move to{" "}
					<span className="font-medium">Interview Scheduled</span>,
					close this modal and use{" "}
					<span className="font-medium">Schedule interview</span> on
					the application — the generic stage update can't carry the
					interview time, timezone, or meeting link.
				</p>
				{blocksOfferWithoutScorecard ? (
					<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
						Moving to{" "}
						<span className="font-medium">Offer Sent</span> from
						Interview Scheduled requires at least one submitted
						scorecard. Ask a hiring manager to submit theirs first.
					</div>
				) : null}
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Reason
						{reasonRequired ? (
							<span className="text-rose-500"> *</span>
						) : (
							<span className="text-slate-400"> (optional)</span>
						)}
					</span>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={3}
						maxLength={500}
						required={reasonRequired}
						placeholder={
							reasonRequired
								? "Required when rejecting — applicant sees this on their stage history."
								: "Captured on the application's stage history."
						}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
					/>
					<p className="mt-1 text-right text-xs text-slate-400">
						{reason.length}/500
					</p>
				</label>
			</form>
		</Modal>
	);
}

function ScreeningPanel({ stages, activeStage, onSelectStage }) {
	const active = stages.find((s) => s.number === activeStage) ?? stages[0];

	return (
		<Card>
			<div className="grid gap-0 md:grid-cols-5">
				<nav
					role="tablist"
					aria-orientation="vertical"
					className="md:col-span-1 border-b border-slate-200 bg-slate-50/60 p-2 md:border-b-0 md:border-r"
				>
					<ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
						{stages.map((stage) => {
							const isActive = stage.number === active.number;
							return (
								<li
									key={stage.number}
									className="shrink-0 md:shrink"
								>
									<button
										type="button"
										role="tab"
										aria-selected={isActive}
										onClick={() =>
											onSelectStage(stage.number)
										}
										className={`w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition md:whitespace-normal ${
											isActive
												? "bg-slate-950 text-white"
												: "text-slate-700 hover:bg-slate-100"
										}`}
									>
										<span
											className={`block text-[10px] font-semibold uppercase tracking-wide ${
												isActive
													? "text-white/70"
													: "text-slate-500"
											}`}
										>
											Stage {stage.number}
										</span>
										<span className="block text-sm font-medium">
											{stage.title}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="md:col-span-4">
					<CardHeader>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Stage {active.number}
								</p>
								<h2 className="mt-1 text-sm font-semibold text-slate-900">
									{active.title}
								</h2>
								<p className="mt-1 text-xs text-slate-500">
									{active.description}
								</p>
							</div>
							{active.headerExtra}
						</div>
					</CardHeader>
					<CardBody className="space-y-4">{active.render()}</CardBody>
				</div>
			</div>
		</Card>
	);
}

function ScoreBlock({ signal }) {
	const hasAny =
		signal && (signal.score != null || signal.explanation || signal.review);

	if (!hasAny) {
		return (
			<p className="text-sm text-slate-500">
				This signal has not been generated yet.
			</p>
		);
	}

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-3">
				<Stat
					label="Score"
					value={signal.score != null ? `${signal.score}` : "—"}
				/>
			</div>
			<Detail label="Explanation" value={signal.explanation} />
			<Detail label="Review" value={signal.review} />
		</>
	);
}

function Stat({ label, value }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 text-base font-semibold text-slate-950">
				{value}
			</p>
		</div>
	);
}

function Metric({ title, value }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{title}
			</p>
			<div className="mt-1 text-base font-semibold text-slate-950">
				{value}
			</div>
		</div>
	);
}

function Detail({ label, value }) {
	if (!value) return null;
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
				{value}
			</p>
		</div>
	);
}

function TagList({ label, items, tone = "neutral" }) {
	const classes =
		tone === "positive"
			? "bg-emerald-50 text-emerald-700 ring-emerald-200"
			: tone === "negative"
				? "bg-rose-50 text-rose-700 ring-rose-200"
				: "bg-slate-100 text-slate-700 ring-slate-200";
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<div className="mt-2 flex flex-wrap gap-1.5">
				{items?.length ? (
					items.map((item) => (
						<span
							key={item}
							className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${classes}`}
						>
							{item}
						</span>
					))
				) : (
					<span className="text-xs text-slate-500">—</span>
				)}
			</div>
		</div>
	);
}

function ResumeProfile({ profile }) {
	const fullName =
		[profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
		profile.email ||
		"Applicant";
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-sm font-semibold text-slate-900">
						Resume Profile
					</h2>
					{profile.resumePdfUrl ? (
						<a
							href={profile.resumePdfUrl}
							target="_blank"
							rel="noreferrer"
							className="text-sm font-medium text-slate-900 underline"
						>
							Open PDF
						</a>
					) : null}
				</div>
			</CardHeader>
			<CardBody className="space-y-5">
				<div className="grid gap-3 sm:grid-cols-2">
					<Stat label="Name" value={fullName} />
					<Stat label="Email" value={profile.email ?? "—"} />
					<Stat label="Phone" value={profile.phoneNumber ?? "—"} />
					<Stat
						label="LinkedIn"
						value={
							profile.linkedIn ? (
								<a
									href={profile.linkedIn}
									target="_blank"
									rel="noreferrer"
									className="text-base font-semibold text-slate-900 underline"
								>
									{profile.linkedIn.replace(
										/^https?:\/\//,
										"",
									)}
								</a>
							) : (
								"—"
							)
						}
					/>
				</div>

				{profile.summary ? (
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Summary
						</p>
						<p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
							{profile.summary}
						</p>
					</div>
				) : null}

				{profile.skills?.length ? (
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Skills
						</p>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{profile.skills.map((s) => (
								<span
									key={s.id}
									className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-inset ring-slate-200"
								>
									{s.name}
								</span>
							))}
						</div>
					</div>
				) : null}

				{profile.workExperiences?.length ? (
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Work experience
						</p>
						<ol className="mt-2 space-y-3">
							{profile.workExperiences.map((w) => (
								<li
									key={w.id}
									className="rounded-md border border-slate-200 p-3"
								>
									<p className="text-sm font-semibold text-slate-900">
										{w.jobTitle} · {w.companyName}
									</p>
									<p className="text-xs text-slate-500">
										{formatRange(w.startDate, w.endDate)}
									</p>
									{w.experience ? (
										<div className="mt-2 text-sm text-slate-700">
											<RichTextViewer
												content={w.experience}
											/>
										</div>
									) : null}
								</li>
							))}
						</ol>
					</div>
				) : null}

				{profile.educations?.length ? (
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
							Education
						</p>
						<ul className="mt-2 space-y-2">
							{profile.educations.map((e) => (
								<li
									key={e.id}
									className="rounded-md border border-slate-200 p-3"
								>
									<p className="text-sm font-semibold text-slate-900">
										{e.degree}
									</p>
									<p className="text-xs text-slate-600">
										{e.institutionName}
									</p>
									<p className="text-xs text-slate-500">
										{formatRange(e.startDate, e.endDate)}
									</p>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</CardBody>
		</Card>
	);
}

function formatRange(startDate, endDate) {
	const fmt = (d) =>
		d
			? new Date(d).toLocaleDateString(undefined, {
					month: "short",
					year: "numeric",
				})
			: null;
	const start = fmt(startDate) ?? "—";
	const end = fmt(endDate) ?? "Present";
	return `${start} – ${end}`;
}

const INTERVIEW_SLOT_STATUS_STYLES = {
	SCHEDULED: "bg-teal-100 text-teal-700 ring-teal-200",
	COMPLETED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
	CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
};

function InterviewSection({ stage, slot, onSchedule, onReschedule, onCancel }) {
	const isActive = slot && slot.status === "SCHEDULED";
	const isCompleted = slot && slot.status === "COMPLETED";
	const isCancelled = slot && slot.status === "CANCELLED";

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<h2 className="text-sm font-semibold text-slate-900">
							Interview
						</h2>
						<p className="mt-1 text-xs text-slate-500">
							Scheduling is the only path into the{" "}
							<span className="font-medium">
								Interview Scheduled
							</span>{" "}
							stage — meeting link is generated automatically.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						{stage === "SCREENING" ? (
							<Button size="sm" onClick={onSchedule}>
								Schedule interview
							</Button>
						) : null}
						{isActive ? (
							<>
								<Button
									size="sm"
									variant="secondary"
									onClick={onReschedule}
								>
									Reschedule
								</Button>
								<Button
									size="sm"
									variant="danger"
									onClick={onCancel}
								>
									Cancel interview
								</Button>
							</>
						) : null}
					</div>
				</div>
			</CardHeader>
			<CardBody>
				{slot ? (
					<div className="space-y-3">
						<div className="flex flex-wrap items-center gap-2">
							<Badge
								className={
									INTERVIEW_SLOT_STATUS_STYLES[slot.status] ??
									"bg-slate-100 text-slate-700 ring-slate-200"
								}
							>
								{slot.status ?? "—"}
							</Badge>
							{slot.meetingProvider ? (
								<span className="text-xs text-slate-500">
									{slot.meetingProvider.replace(/_/g, " ")}
								</span>
							) : null}
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<Stat
								label="Starts"
								value={formatDateTime(
									slot.startTime,
									slot.timezone,
								)}
							/>
							<Stat
								label="Ends"
								value={formatDateTime(
									slot.endTime,
									slot.timezone,
								)}
							/>
							<Stat
								label="Timezone"
								value={slot.timezone ?? "—"}
							/>
							<Stat
								label="Interviewer"
								value={slot.interviewerEmail ?? "—"}
							/>
						</div>
						{slot.meetingLink ? (
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Meeting link
								</p>
								<a
									href={slot.meetingLink}
									target="_blank"
									rel="noreferrer"
									className="mt-1 inline-block text-sm font-medium text-slate-900 underline"
								>
									{slot.meetingLink}
								</a>
							</div>
						) : null}
						{slot.notes ? (
							<Detail label="Notes" value={slot.notes} />
						) : null}
						{isCompleted ? (
							<p className="text-xs text-emerald-700">
								Interview completed — submit a scorecard below.
							</p>
						) : null}
						{isCancelled ? (
							<p className="text-xs text-slate-500">
								This slot is cancelled. The application is back
								under screening.
							</p>
						) : null}
					</div>
				) : (
					<p className="text-sm text-slate-500">
						{stage === "SCREENING"
							? "No interview scheduled yet."
							: "No interview slot on file for this application."}
					</p>
				)}
			</CardBody>
		</Card>
	);
}

function ScorecardSection({
	slot,
	scorecards,
	canSubmit,
	isHrManager,
	alreadySubmitted,
	onSubmit,
}) {
	const submitted = scorecards?.length ?? 0;

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div>
						<h2 className="text-sm font-semibold text-slate-900">
							Scorecards
							{submitted ? (
								<span className="ml-2 text-xs font-normal text-slate-500">
									{submitted} submitted
								</span>
							) : null}
						</h2>
						<p className="mt-1 text-xs text-slate-500">
							Each hiring manager submits one scorecard per
							interview slot. Submitting marks the slot completed;
							the application stage does not change.
						</p>
					</div>
					{canSubmit ? (
						<Button size="sm" onClick={onSubmit}>
							Submit scorecard
						</Button>
					) : null}
				</div>
			</CardHeader>
			<CardBody>
				{!slot ? (
					<p className="text-sm text-slate-500">
						Schedule an interview before submitting a scorecard.
					</p>
				) : slot.status === "CANCELLED" ? (
					<p className="text-sm text-slate-500">
						The interview was cancelled, no scorecard required.
					</p>
				) : scorecards.length ? (
					<ol className="space-y-4">
						{scorecards.map((sc) => (
							<li key={sc.id}>
								<ScorecardSummary scorecard={sc} />
							</li>
						))}
					</ol>
				) : (
					<p className="text-sm text-slate-500">
						No scorecards submitted yet.
					</p>
				)}
				{slot && slot.status !== "CANCELLED" && !canSubmit ? (
					<p className="mt-3 text-xs text-slate-500">
						{!isHrManager
							? "Only hiring managers can submit scorecards. Admins can view results."
							: alreadySubmitted
								? "You've already submitted a scorecard for this interview. Other hiring managers can still submit theirs."
								: null}
					</p>
				) : null}
			</CardBody>
		</Card>
	);
}

function ScorecardSummary({ scorecard }) {
	const {
		totalScore,
		maxPossibleScore,
		overallNotes,
		interviewerEmail,
		submittedByEmail,
		submittedByRole,
		submittedAt,
		templateName,
		templateNameSnapshot,
	} = scorecard;
	return (
		<div className="space-y-4 rounded-md border border-slate-200 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="text-sm font-semibold text-slate-900">
						{submittedByEmail ??
							interviewerEmail ??
							"Hiring manager"}
					</p>
					<p className="text-xs text-slate-500">
						{[submittedByRole, templateName ?? templateNameSnapshot]
							.filter(Boolean)
							.join(" · ")}
						{submittedAt
							? ` · ${new Date(submittedAt).toLocaleString()}`
							: ""}
					</p>
				</div>
				<Badge className="bg-emerald-100 text-emerald-700 ring-emerald-200">
					{totalScore != null && maxPossibleScore != null
						? `${totalScore} / ${maxPossibleScore}`
						: "—"}
				</Badge>
			</div>
			{Array.isArray(scorecard.scores) && scorecard.scores.length ? (
				<ol className="space-y-2">
					{scorecard.scores.map((s) => (
						<li
							key={s.id ?? s.criterionId}
							className="rounded-md border border-slate-200 p-3"
						>
							<div className="flex items-center justify-between gap-2">
								<p className="text-sm font-medium text-slate-900">
									{s.criterionCategorySnapshot
										? `${s.criterionCategorySnapshot} · `
										: ""}
									{s.criterionNameSnapshot ??
										s.criterionName ??
										"—"}
								</p>
								<span className="text-sm font-semibold text-slate-900">
									{s.score}
									{s.maxScoreSnapshot != null
										? ` / ${s.maxScoreSnapshot}`
										: ""}
								</span>
							</div>
							{s.notes ? (
								<p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
									{s.notes}
								</p>
							) : null}
						</li>
					))}
				</ol>
			) : null}
			{overallNotes ? (
				<Detail label="Overall notes" value={overallNotes} />
			) : null}
		</div>
	);
}

function InterviewModal({
	title,
	submitLabel,
	submitting,
	initial,
	onClose,
	onSubmit,
}) {
	const [startTime, setStartTime] = useState(
		initial?.startTime ? toLocalInput(initial.startTime) : "",
	);
	const [endTime, setEndTime] = useState(
		initial?.endTime ? toLocalInput(initial.endTime) : "",
	);
	const [timezone, setTimezone] = useState(
		initial?.timezone ??
			Intl.DateTimeFormat().resolvedOptions().timeZone ??
			"UTC",
	);
	const [interviewerEmail, setInterviewerEmail] = useState(
		initial?.interviewerEmail ?? "",
	);
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [error, setError] = useState("");

	const nowLocal = toLocalInput(new Date().toISOString());

	function handleSubmit(event) {
		event.preventDefault();
		if (!startTime || !endTime || !timezone || !interviewerEmail) return;
		const startDate = new Date(startTime);
		const endDate = new Date(endTime);
		const now = new Date();
		now.setSeconds(0, 0);
		if (startDate < now) {
			setError("Start time cannot be in the past.");
			return;
		}
		if (endDate <= startDate) {
			setError("End time must be after the start time.");
			return;
		}
		setError("");
		onSubmit?.({
			startTime: fromLocalInput(startTime),
			endTime: fromLocalInput(endTime),
			timezone,
			interviewerEmail: interviewerEmail.trim(),
			notes: notes.trim() || undefined,
		});
	}

	const startDate = startTime ? new Date(startTime) : null;
	const endDate = endTime ? new Date(endTime) : null;
	const nowFloor = new Date();
	nowFloor.setSeconds(0, 0);
	const isStartPast = startDate && startDate < nowFloor;
	const isEndBeforeStart = startDate && endDate && endDate <= startDate;

	const canSubmit =
		startTime &&
		endTime &&
		timezone &&
		interviewerEmail.trim() &&
		!isStartPast &&
		!isEndBeforeStart;

	return (
		<Modal
			open
			onClose={onClose}
			title={title}
			size="md"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !canSubmit}
					>
						{submitting ? "Saving…" : submitLabel}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3">
				<div className="grid gap-3 sm:grid-cols-2">
					<label className="block">
						<span className="mb-1 block text-sm font-medium text-slate-800">
							Start time
						</span>
						<input
							type="datetime-local"
							value={startTime}
							min={nowLocal}
							onChange={(e) => {
								setStartTime(e.target.value);
								setError("");
							}}
							required
							className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
						/>
						{isStartPast ? (
							<p className="mt-1 text-xs text-red-600">
								Start time cannot be in the past.
							</p>
						) : null}
					</label>
					<label className="block">
						<span className="mb-1 block text-sm font-medium text-slate-800">
							End time
						</span>
						<input
							type="datetime-local"
							value={endTime}
							min={startTime || nowLocal}
							onChange={(e) => {
								setEndTime(e.target.value);
								setError("");
							}}
							required
							className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
						/>
						{isEndBeforeStart ? (
							<p className="mt-1 text-xs text-red-600">
								End time must be after the start time.
							</p>
						) : null}
					</label>
				</div>
				{error ? <p className="text-sm text-red-600">{error}</p> : null}
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Timezone
					</span>
					<input
						type="text"
						value={timezone}
						onChange={(e) => setTimezone(e.target.value)}
						required
						placeholder="America/Los_Angeles"
						className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
					/>
					<p className="mt-1 text-xs text-slate-500">
						Use an IANA timezone identifier.
					</p>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Interviewer email
					</span>
					<input
						type="email"
						value={interviewerEmail}
						onChange={(e) => setInterviewerEmail(e.target.value)}
						required
						className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
					/>
				</label>
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Notes (optional)
					</span>
					<textarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						rows={3}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
						placeholder="e.g. Round 1 technical"
					/>
				</label>
				<p className="text-xs text-slate-500">
					Duration must be between 15 minutes and 4 hours; the meeting
					link is generated automatically.
				</p>
			</form>
		</Modal>
	);
}

function CancelInterviewModal({ submitting, onClose, onSubmit }) {
	const [reason, setReason] = useState("");

	function handleSubmit(event) {
		event.preventDefault();
		onSubmit?.(reason.trim() || undefined);
	}

	return (
		<Modal
			open
			onClose={onClose}
			title="Cancel interview"
			size="sm"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Keep interview
					</Button>
					<Button
						variant="danger"
						onClick={handleSubmit}
						disabled={submitting}
					>
						{submitting ? "Cancelling…" : "Cancel interview"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3">
				<p className="text-sm text-slate-600">
					Cancelling the slot bounces the application back to{" "}
					<span className="font-medium">Screening</span>. The
					applicant is notified.
				</p>
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Reason (optional)
					</span>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={3}
						maxLength={500}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
						placeholder="Captured on the stage history entry."
					/>
				</label>
			</form>
		</Modal>
	);
}

function SubmitScorecardModal({ slot, submitting, onClose, onSubmit }) {
	const {
		data: templatesResponse,
		isLoading: templatesLoading,
		isError: templatesError,
	} = useListScorecardTemplatesQuery();
	const templates = useMemo(() => {
		const list = Array.isArray(templatesResponse)
			? templatesResponse
			: (templatesResponse?.content ?? []);
		return list.filter((t) => t.isActive !== false);
	}, [templatesResponse]);

	const [templateId, setTemplateId] = useState("");
	const [scores, setScores] = useState({});
	const [overallNotes, setOverallNotes] = useState("");

	const activeTemplate = useMemo(
		() => templates.find((t) => t.id === templateId) ?? null,
		[templates, templateId],
	);
	const criteria = activeTemplate?.criteria ?? [];

	function setScore(criterionId, key, value) {
		setScores((current) => ({
			...current,
			[criterionId]: { ...current[criterionId], [key]: value },
		}));
	}

	function handleSubmit(event) {
		event.preventDefault();
		if (!templateId || !criteria.length) return;
		const missing = criteria.find(
			(c) =>
				scores[c.id]?.score === undefined || scores[c.id]?.score === "",
		);
		if (missing) return;
		onSubmit?.({
			interviewSlotId: slot.id,
			templateId,
			overallNotes: overallNotes.trim() || undefined,
			scores: criteria.map((c) => ({
				criterionId: c.id,
				score: Number(scores[c.id].score),
				notes: scores[c.id]?.notes?.trim() || undefined,
			})),
		});
	}

	const allScored =
		criteria.length > 0 &&
		criteria.every((c) => {
			const raw = scores[c.id]?.score;
			if (raw === undefined || raw === "") return false;
			const n = Number(raw);
			return !Number.isNaN(n) && n >= 0 && n <= (c.maxScore ?? Infinity);
		});

	return (
		<Modal
			open
			onClose={onClose}
			title="Submit scorecard"
			size="lg"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !templateId || !allScored}
					>
						{submitting ? "Submitting…" : "Submit scorecard"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				{templatesLoading ? (
					<p className="text-sm text-slate-600">Loading templates…</p>
				) : templatesError ? (
					<p className="text-sm text-rose-600">
						Unable to load scorecard templates.
					</p>
				) : !templates.length ? (
					<p className="text-sm text-amber-700">
						No active scorecard templates. Ask an admin to create
						one under Scorecard Templates first.
					</p>
				) : (
					<>
						<Select
							label="Template"
							value={templateId}
							onChange={(e) => {
								setTemplateId(e.target.value);
								setScores({});
							}}
							options={[
								{ value: "", label: "Select a template…" },
								...templates.map((t) => ({
									value: t.id,
									label: t.name,
								})),
							]}
						/>
						{criteria.length ? (
							<ol className="space-y-3">
								{criteria.map((c, i) => (
									<li
										key={c.id}
										className="space-y-2 rounded-md border border-slate-200 p-3"
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
													{c.category} · #{i + 1}
												</p>
												<p className="text-sm font-medium text-slate-900">
													{c.name}
												</p>
												{c.description ? (
													<p className="text-xs text-slate-500">
														{c.description}
													</p>
												) : null}
											</div>
											<div className="text-xs text-slate-500">
												Max {c.maxScore}
											</div>
										</div>
										<div className="grid gap-2 sm:grid-cols-[120px_1fr]">
											<label className="block">
												<span className="mb-1 block text-xs font-medium text-slate-700">
													Score
												</span>
												<input
													type="number"
													min={0}
													max={c.maxScore}
													value={
														scores[c.id]?.score ??
														""
													}
													onChange={(e) =>
														setScore(
															c.id,
															"score",
															e.target.value,
														)
													}
													required
													className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
												/>
											</label>
											<label className="block">
												<span className="mb-1 block text-xs font-medium text-slate-700">
													Notes
												</span>
												<input
													type="text"
													value={
														scores[c.id]?.notes ??
														""
													}
													onChange={(e) =>
														setScore(
															c.id,
															"notes",
															e.target.value,
														)
													}
													className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
													placeholder="What stood out?"
												/>
											</label>
										</div>
									</li>
								))}
							</ol>
						) : null}
						<label className="block">
							<span className="mb-1 block text-sm font-medium text-slate-800">
								Overall notes (optional)
							</span>
							<textarea
								value={overallNotes}
								onChange={(e) =>
									setOverallNotes(e.target.value)
								}
								rows={3}
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
								placeholder="Recommendation, strengths, concerns."
							/>
						</label>
					</>
				)}
			</form>
		</Modal>
	);
}

function formatDateTime(iso, timezone) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleString(undefined, {
			timeZone: timezone || undefined,
			dateStyle: "medium",
			timeStyle: "short",
		});
	} catch {
		return new Date(iso).toLocaleString();
	}
}

function toLocalInput(iso) {
	const d = new Date(iso);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local) {
	return new Date(local).toISOString();
}

export default JobApplicationDetailPage;
