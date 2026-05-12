import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import StageBadge from "../../components/domain/StageBadge";
import RichTextViewer from "../../components/editor/RichTextViewer";
import { ROUTES } from "../../constants/routes";
import { useGetJobQuery } from "../../api/jobsApi";
import { useGetMyApplicationsQuery } from "../../api/applicationsApi";
import { useGetResumeProfileQuery } from "../../api/resumeApi";
import { formatDate } from "../../utils/date";
import {
	computeJobMatchDetails,
	employmentTypeLabel,
	matchSkills,
	nextStageLabel,
	stageEta,
} from "../../utils/applicant";
import ApplyModal from "./ApplyModal";

function JobDetail() {
	const { id } = useParams();
	const [applyOpen, setApplyOpen] = useState(false);

	const {
		data: job,
		isLoading: isJobLoading,
		isError: isJobError,
	} = useGetJobQuery(id ?? "", { skip: !id });

	const { data: resumeProfile } = useGetResumeProfileQuery();
	const { data: applicationsResponse } = useGetMyApplicationsQuery({
		page: 0,
		size: 100,
	});

	const application = useMemo(() => {
		if (!job) return null;
		const list = applicationsResponse?.content ?? [];
		return list.find((app) => app.jobListingId === job.id) ?? null;
	}, [applicationsResponse?.content, job]);

	const match = useMemo(
		() => (job ? computeJobMatchDetails(job, resumeProfile) : null),
		[job, resumeProfile],
	);
	const skills = useMemo(
		() => matchSkills(job, resumeProfile),
		[job, resumeProfile],
	);

	if (isJobLoading) {
		return (
			<EmptyState
				title="Loading job"
				description="Fetching this role from the server..."
			/>
		);
	}

	if (isJobError || !job) {
		return (
			<EmptyState
				title="Job not found"
				description="This role may have moved or closed."
			/>
		);
	}

	const totalRequiredSkills = job.skills?.length ?? 0;
	const matchedCount = skills.matched.length;

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<Link
				to={ROUTES.APPLICANT_JOBS}
				className="text-sm font-medium text-slate-600 hover:text-slate-950"
			>
				Back to jobs
			</Link>

			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<p className="text-sm text-slate-500">
							{job.companyName ?? "Company"}
						</p>
						<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
							{job.title}
						</h1>
						<p className="mt-3 text-base text-slate-600">
							{[job.location, employmentTypeLabel(job.type)]
								.filter(Boolean)
								.join(" · ")}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
								Easy Apply
							</Badge>
							{job.companyId ? (
								<Link
									to={ROUTES.APPLICANT_COMPANY_PROFILE(job.companyId)}
								>
									<Badge className="bg-blue-50 text-blue-700 ring-blue-200">
										View company profile
									</Badge>
								</Link>
							) : null}
						</div>
					</div>

					<div className="w-full rounded-xl border border-slate-200 p-4 lg:w-72">
						<p className="text-sm font-semibold text-slate-950">
							Your fit
						</p>
						<MatchPercentBar value={match?.score ?? 0} className="mt-3" />
						<p className="mt-3 text-sm text-slate-600">
							{matchedCount} of {totalRequiredSkills || 0} required
							skills appear in your resume.
						</p>
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
				<main className="space-y-5">
					{job.summary ? (
						<Section title="Summary">
							<RichTextViewer content={job.summary} />
						</Section>
					) : null}

					{job.responsibilities ? (
						<Section title="Responsibilities">
							<RichTextViewer content={job.responsibilities} />
						</Section>
					) : null}

					{job.requiredQualifications ? (
						<Section title="Required qualifications">
							<RichTextViewer content={job.requiredQualifications} />
						</Section>
					) : null}

					{job.preferredQualifications ? (
						<Section title="Preferred qualifications">
							<RichTextViewer content={job.preferredQualifications} />
						</Section>
					) : null}

					{job.skills?.length ? (
						<Section title="Skills in this role">
							<div className="flex flex-wrap gap-2">
								{job.skills.map((skill) => (
									<Badge
										key={skill.id}
										className="bg-slate-50 text-slate-700 ring-slate-200"
									>
										{skill.name}
									</Badge>
								))}
							</div>
							{skills.matched.length ? (
								<p className="mt-3 text-sm text-slate-600">
									Matched from your resume:{" "}
									{skills.matched.join(", ")}
								</p>
							) : null}
						</Section>
					) : null}

					<Section title="Hiring process preview">
						<div className="grid gap-3 sm:grid-cols-4">
							{["Apply", "AI screening", "Interview", "Offer"].map(
								(step) => (
									<div
										key={step}
										className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700"
									>
										{step}
									</div>
								),
							)}
						</div>
					</Section>
				</main>

				<aside className="lg:sticky lg:top-20 lg:self-start">
					<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
						{application ? (
							<div className="space-y-3">
								<StageBadge stage={application.stage} />
								<p className="text-sm font-semibold text-slate-950">
									Applied {formatDate(application.createdAt)}
								</p>
								<p className="text-sm text-slate-600">
									Next: {nextStageLabel(application.stage)}
								</p>
								<p className="text-sm text-slate-600">
									{stageEta(application.stage)}
								</p>
								<Link
									to={ROUTES.APPLICANT_APPLICATION(application.id)}
								>
									<Button variant="secondary" className="mt-2 w-full">
										Track application
									</Button>
								</Link>
							</div>
						) : (
							<div className="space-y-3">
								<Button
									className="w-full"
									onClick={() => setApplyOpen(true)}
								>
									Apply now
								</Button>
								<Button variant="secondary" className="w-full">
									Save job
								</Button>
								<p className="text-xs leading-5 text-slate-500">
									Quick apply submits with the resume profile on
									file.
								</p>
							</div>
						)}
					</div>
				</aside>
			</div>

			<ApplyModal
				job={job}
				open={applyOpen}
				onClose={() => setApplyOpen(false)}
				existingApplication={application}
			/>
		</div>
	);
}

function Section({ title, children }) {
	return (
		<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
			<div className="mt-3 text-sm leading-6 text-slate-700">
				{children}
			</div>
		</section>
	);
}

export default JobDetail;
