import { useMemo, useState } from "react";
import { Link } from "react-router";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import { JOB_LISTING_STATUS } from "../../constants/jobStatus";
import { ROUTES } from "../../constants/routes";
import { EMPLOYMENT_TYPE_LABELS } from "../../constants/employment";
import { useGetOpenJobsQuery } from "../../api/jobsApi";
import { useGetMyApplicationsQuery } from "../../api/applicationsApi";
import { useGetResumeProfileQuery } from "../../api/resumeApi";
import {
	applicationLastUpdated,
	computeJobMatchDetails,
	employmentTypeLabel,
	formatSalary,
	matchSkills,
	nextStageLabel,
	stageEta,
} from "../../utils/applicant";
import ApplyModal from "./ApplyModal";
import JobCard from "./JobCard";
import RichTextViewer from "../../components/editor/RichTextViewer";

const VISIBLE_STEP = 6;

function JobDiscovery() {
	const [query, setQuery] = useState("");
	const [jobType, setJobType] = useState("");
	const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
	const [applyJob, setApplyJob] = useState(null);
	const [selectedId, setSelectedId] = useState(null);

	const { data: apiResponse, isLoading: isJobsLoading } = useGetOpenJobsQuery(
		{
			page: 0,
			size: 50,
			title: query || undefined,
			type: jobType || undefined,
		},
	);

	const { data: resumeProfile } = useGetResumeProfileQuery();
	const { data: applicationsResponse } = useGetMyApplicationsQuery({
		page: 0,
		size: 100,
	});

	const applicationByJobId = useMemo(() => {
		const map = new Map();
		for (const app of applicationsResponse?.content ?? []) {
			if (app.jobListingId) map.set(app.jobListingId, app);
		}
		return map;
	}, [applicationsResponse?.content]);

	const jobs = useMemo(() => {
		return apiResponse?.content || [];
	}, [apiResponse?.content]);

	const matchByJobId = useMemo(() => {
		const map = new Map();
		for (const job of jobs) {
			map.set(job.id, computeJobMatchDetails(job, resumeProfile));
		}
		return map;
	}, [jobs, resumeProfile]);

	const openJobs = useMemo(() => {
		return jobs.filter((job) => job.status === JOB_LISTING_STATUS.OPEN);
	}, [jobs]);

	const filteredJobs = useMemo(() => {
		const q = query.trim().toLowerCase();

		return openJobs.filter((job) => {
			const matchesQuery = q
				? job.title?.toLowerCase().includes(q)
				: true;

			const matchesType = jobType ? job.type === jobType : true;

			return matchesQuery && matchesType;
		});
	}, [openJobs, query, jobType]);

	const visibleJobs = useMemo(() => {
		return filteredJobs.slice(0, visibleCount);
	}, [filteredJobs, visibleCount]);

	const selectedJob =
		filteredJobs.find((job) => job.id === selectedId) ||
		visibleJobs[0] ||
		filteredJobs[0] ||
		null;

	const selectedApplication = selectedJob
		? applicationByJobId.get(selectedJob.id) ?? null
		: null;

	const selectedMatch =
		(selectedJob && matchByJobId.get(selectedJob.id)?.score) || 0;

	const selectedSkills = selectedJob
		? matchSkills(selectedJob, resumeProfile)
		: null;

	const applyApplication = applyJob
		? applicationByJobId.get(applyJob.id) ?? null
		: null;

	return (
		<div className="space-y-6">
			<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end">
					<div className="flex-1">
						<p className="text-sm font-medium text-slate-500">
							Find Jobs
						</p>

						<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
							Find work that feels right.
						</h1>
					</div>

					<div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_220px] lg:w-[560px]">
						<Input
							label="Search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Title"
						/>

						<Select
							label="Employment type"
							value={jobType}
							onChange={(e) => setJobType(e.target.value)}
							options={[
								{
									value: "",
									label: "Any",
								},
								...Object.entries(EMPLOYMENT_TYPE_LABELS).map(
									([value, label]) => ({
										value,
										label,
									}),
								),
							]}
						/>
					</div>
				</div>
			</section>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
				<section className="space-y-3">
					{isJobsLoading ? (
						<EmptyState
							title="Loading jobs"
							description="Finding open roles..."
						/>
					) : visibleJobs.length ? (
						<>
							{visibleJobs.map((job) => {
								const application =
									applicationByJobId.get(job.id) ?? null;

								return (
									<JobCard
										key={job.id}
										job={job}
										match={matchByJobId.get(job.id)?.score ?? 0}
										application={application}
										selected={selectedJob?.id === job.id}
										onSelect={() => setSelectedId(job.id)}
										onApply={() => setApplyJob(job)}
									/>
								);
							})}

							{visibleCount < filteredJobs.length ? (
								<Button
									variant="secondary"
									className="w-full"
									onClick={() =>
										setVisibleCount(
											(count) => count + VISIBLE_STEP,
										)
									}
								>
									Load more jobs
								</Button>
							) : null}
						</>
					) : (
						<EmptyState
							title="No open jobs match that search"
							description="Try a broader title, skill, or work mode."
						/>
					)}
				</section>

				<aside className="hidden lg:block">
					{selectedJob ? (
						<div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm text-slate-500">
										{selectedJob.companyName}
									</p>

									<h2 className="mt-1 text-2xl font-semibold text-slate-950">
										{selectedJob.title}
									</h2>

									<p className="mt-2 text-sm text-slate-600">
										{selectedJob.location} ·{" "}
										{employmentTypeLabel(selectedJob.type)}
									</p>
								</div>

							</div>

							<div className="mt-5 grid gap-3 sm:grid-cols-2">
								{selectedJob.salary ? (
									<div className="rounded-lg bg-slate-50 p-4">
										<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
											Salary
										</p>

										<p className="mt-1 text-sm font-semibold text-slate-950">
											{formatSalary(selectedJob.salary)}
										</p>
									</div>
								) : null}

								<div className="rounded-lg bg-emerald-50 p-4">
									<p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
										Job match
									</p>

									<MatchPercentBar
										value={selectedMatch}
										className="mt-2"
									/>
								</div>
							</div>

							{selectedApplication ? (
								<div className="mt-5 rounded-lg border border-slate-200 p-4">
									<p className="text-sm font-semibold text-slate-950">
										You applied on{" "}
										{applicationLastUpdated(
											selectedApplication,
										)}
									</p>

									<p className="mt-1 text-sm text-slate-600">
										Next:{" "}
										{nextStageLabel(
											selectedApplication.stage,
										)}
									</p>

									<p className="mt-1 text-sm text-slate-600">
										{stageEta(
											selectedApplication.stage,
										)}
									</p>
								</div>
							) : null}

							{selectedJob.summary ? (
								<div className="mt-5">
									<p className="text-sm font-semibold text-slate-950">
										Summary
									</p>

									<RichTextViewer
										content={selectedJob.summary}
										className="mt-2"
									/>
								</div>
							) : null}

							{selectedJob.responsibilities ? (
								<div className="mt-5">
									<p className="text-sm font-semibold text-slate-950">
										Responsibilities
									</p>

									<RichTextViewer
										content={selectedJob.responsibilities}
										className="mt-2"
									/>
								</div>
							) : null}

							{selectedJob.requiredQualifications ? (
								<div className="mt-5">
									<p className="text-sm font-semibold text-slate-950">
										Required Qualifications
									</p>

									<RichTextViewer
										content={
											selectedJob.requiredQualifications
										}
										className="mt-2"
									/>
								</div>
							) : null}

							{selectedJob.preferredQualifications ? (
								<div className="mt-5">
									<p className="text-sm font-semibold text-slate-950">
										Preferred Qualifications
									</p>

									<RichTextViewer
										content={
											selectedJob.preferredQualifications
										}
										className="mt-2"
									/>
								</div>
							) : null}

							<div className="mt-5">
								<p className="text-sm font-semibold text-slate-950">
									Skills in this role
								</p>

								<div className="mt-2 flex flex-wrap gap-2">
									{selectedJob.skills?.map((skill) => (
										<span
											key={skill.id}
											className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
										>
											{skill.name}
										</span>
									))}
								</div>

								{selectedSkills?.matched ? (
									<p className="mt-3 text-sm text-slate-600">
										Matched:{" "}
										{selectedSkills.matched.join(", ") ||
											"None yet"}
									</p>
								) : null}
							</div>

							<div className="mt-6 flex gap-3">
								<Button
									onClick={() => setApplyJob(selectedJob)}
									disabled={!!selectedApplication}
								>
									{selectedApplication
										? "Already applied"
										: "Easy apply"}
								</Button>

								<Link
									to={ROUTES.APPLICANT_JOB_DETAIL(
										selectedJob.id,
									)}
								>
									<Button variant="secondary">
										View details
									</Button>
								</Link>
							</div>
						</div>
					) : null}
				</aside>
			</div>

			<ApplyModal
				job={applyJob}
				open={!!applyJob}
				onClose={() => setApplyJob(null)}
				existingApplication={applyApplication}
			/>
		</div>
	);
}

export default JobDiscovery;
