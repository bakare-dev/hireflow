import { Link, useParams } from "react-router";
import { useSelector } from "react-redux";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StageBadge from "../../components/domain/StageBadge";
import { ROUTES } from "../../constants/routes";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDate } from "../../utils/date";
import {
	avgAiMatchForJob,
	roleScopedApplications,
	roleScopedJobs,
	stageCounts,
} from "./recruitmentUtils";

function JobDetailDashboardPage() {
	const { id } = useParams();
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const scopedJobs = roleScopedJobs(jobs, role, user);
	const job = scopedJobs.find((item) => item.id === id);
	const scopedApps = roleScopedApplications(applications, scopedJobs, role, user);
	const jobApps = scopedApps.filter((app) => app.jobListingId === id);
	const counts = stageCounts(jobApps);
	const aiAvg = avgAiMatchForJob(id, scopedApps);
	const tabs = ["Candidates", "Analytics", "Interviews", "Notes", "Activity"];

	const applied = counts.APPLIED || 0;
	const hired = counts.HIRED || 0;
	const conversion = applied ? Math.round((hired / applied) * 100) : 0;

	if (!job) {
		return (
			<div className="space-y-4">
				<PageHeader
					title="Job not found"
					description="This job may be unavailable for your role scope."
				/>
				<Link to={ROUTES.JOB_LISTINGS} className="text-sm text-slate-600 underline">
					Back to listings
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Job Detail Dashboard"
				title={job.title}
				description={`${job.location} · created ${formatDate(job.createdAt)}`}
			/>

			<div className="flex flex-wrap gap-2">
				{tabs.map((tab) => (
					<span
						key={tab}
						className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
					>
						{tab}
					</span>
				))}
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Metric title="Applicants" value={jobApps.length} />
				<Metric title="Avg AI Match" value={`${aiAvg || 0}%`} />
				<Metric title="Interview Progress" value={counts.INTERVIEW_SCHEDULED || 0} />
				<Metric title="Conversion Rate" value={`${conversion}%`} />
			</div>

			<div className="grid gap-5 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Pipeline Metrics
						</h2>
					</CardHeader>
					<CardBody className="space-y-3">
						{Object.entries(counts).map(([stage, count]) => (
							<div key={stage} className="flex items-center justify-between">
								<StageBadge stage={stage} />
								<span className="text-sm font-semibold text-slate-900">
									{count}
								</span>
							</div>
						))}
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							AI Insights & Bottlenecks
						</h2>
					</CardHeader>
					<CardBody className="space-y-2 text-sm text-slate-700">
						<p>Skill mismatch is highest for {job.requiredSkills[0] ?? "core"} competency.</p>
						<p>Screening to interview conversion is lower than target this cycle.</p>
						<p>Interview scheduling lag appears after stage transitions on weekdays.</p>
						<p>Candidate momentum is strongest in first 72 hours post-application.</p>
					</CardBody>
				</Card>
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

export default JobDetailDashboardPage;
