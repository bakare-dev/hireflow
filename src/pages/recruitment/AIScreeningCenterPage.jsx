import { useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import {
	aiByApplicationId,
	getUserMap,
	roleScopedApplications,
	roleScopedJobs,
} from "./recruitmentUtils";

function AIScreeningCenterPage() {
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const users = getUserMap();
	const aiMap = aiByApplicationId();
	const scopedJobs = roleScopedJobs(jobs, role, user);
	const scopedApps = roleScopedApplications(applications, scopedJobs, role, user);
	const [jobFilter, setJobFilter] = useState("ALL");
	const jobsById = new Map(scopedJobs.map((job) => [job.id, job]));

	const aiRows = scopedApps
		.filter((app) => jobFilter === "ALL" || app.jobListingId === jobFilter)
		.map((app) => ({ app, ai: aiMap.get(app.id) }))
		.filter((row) => row.ai);

	const autoApproved = aiRows.filter((row) => row.ai.matchPercentage >= 75);
	const borderline = aiRows.filter(
		(row) => row.ai.matchPercentage >= 40 && row.ai.matchPercentage < 75,
	);
	const autoRejected = aiRows.filter((row) => row.ai.matchPercentage < 40);

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Intelligence"
				title="AI Screening Center"
				description="AI triage workspace for approval trends, borderline reviews, and rejection audits."
			/>
			<div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
				<label className="text-sm font-medium text-slate-800">Job posting</label>
				<select
					value={jobFilter}
					onChange={(event) => setJobFilter(event.target.value)}
					className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm"
				>
					<option value="ALL">All jobs</option>
					{scopedJobs.map((job) => (
						<option key={job.id} value={job.id}>
							{job.title}
						</option>
					))}
				</select>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<Metric title="Auto-approved" value={autoApproved.length} />
				<Metric title="Borderline review" value={borderline.length} />
				<Metric title="Auto-rejected" value={autoRejected.length} />
			</div>

			<div className="grid gap-5 xl:grid-cols-3">
				<QueueColumn title="Auto-approved" rows={autoApproved} users={users} jobsById={jobsById} />
				<QueueColumn title="Borderline review" rows={borderline} users={users} jobsById={jobsById} />
				<QueueColumn title="Auto-rejected" rows={autoRejected} users={users} jobsById={jobsById} />
			</div>
		</div>
	);
}

function Metric({ title, value }) {
	return (
		<Card>
			<CardBody>
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					{title}
				</p>
				<p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
			</CardBody>
		</Card>
	);
}

function QueueColumn({ title, rows, users, jobsById }) {
	return (
		<Card>
			<CardHeader>
				<h2 className="text-sm font-semibold text-slate-900">{title}</h2>
			</CardHeader>
			<CardBody className="space-y-3">
				{rows.length ? (
					rows.map(({ app, ai }) => {
						const candidate = users.get(app.applicantId);
						const job = jobsById.get(app.jobListingId);
						return (
							<div key={app.id} className="rounded-lg border border-slate-200 p-3">
								<div className="mb-2 flex items-start justify-between gap-2">
									<div>
										<p className="font-medium text-slate-900">
											{candidate?.name ?? app.applicantId}
										</p>
										<p className="text-xs text-slate-500">{job?.title}</p>
									</div>
									<Badge className="bg-slate-100 text-slate-700 ring-slate-200">
										{ai.matchPercentage}%
									</Badge>
								</div>
								<p className="text-xs text-slate-600">
									Missing: {(ai.unmatchedSkills ?? []).join(", ") || "None"}
								</p>
								<p className="mt-1 text-xs text-slate-500">{ai.summaryNote}</p>
							</div>
						);
					})
				) : (
					<p className="text-sm text-slate-600">No candidates in this queue.</p>
				)}
			</CardBody>
		</Card>
	);
}

export default AIScreeningCenterPage;
