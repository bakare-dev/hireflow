import { useState } from "react";
import { Link, useParams } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import RichTextViewer from "../../components/editor/RichTextViewer";
import { ROUTES } from "../../constants/routes";
import { STAGE_BADGE_COLORS, STAGE_LABELS } from "../../constants/stages";
import { useGetMyApplicationQuery } from "../../api/applicationsApi";

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
	const [resumeOpen, setResumeOpen] = useState(false);
	const [activeStage, setActiveStage] = useState(1);

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
											items={screeningResult.matchedSkills}
											tone="positive"
										/>
										<TagList
											label="Unmatched skills"
											items={screeningResult.unmatchedSkills}
											tone="negative"
										/>
									</div>
									<Detail
										label="AI narrative summary"
										value={screeningResult.aiNarrativeSummary}
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
								<ScoreBlock signal={screeningResult.resumeAnalysis} />
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
							headerExtra: screeningResult.inconsistencySeverity ? (
								<Badge
									className={
										SEVERITY_STYLES[
											screeningResult.inconsistencySeverity
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
												screeningResult.inconsistencyReview
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
											screeningResult.inconsistencyReview?.review
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
		</div>
	);
}

function ScreeningPanel({ stages, activeStage, onSelectStage }) {
	const active =
		stages.find((s) => s.number === activeStage) ?? stages[0];

	return (
		<Card>
			<div className="grid gap-0 md:grid-cols-5">
				{/* Left rail: 20% — stage picker */}
				<nav
					role="tablist"
					aria-orientation="vertical"
					className="md:col-span-1 border-b border-slate-200 bg-slate-50/60 p-2 md:border-b-0 md:border-r"
				>
					<ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
						{stages.map((stage) => {
							const isActive = stage.number === active.number;
							return (
								<li key={stage.number} className="shrink-0 md:shrink">
									<button
										type="button"
										role="tab"
										aria-selected={isActive}
										onClick={() => onSelectStage(stage.number)}
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

				{/* Right pane: 80% — active stage content */}
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

export default JobApplicationDetailPage;
