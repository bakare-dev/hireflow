import { Link } from "react-router";
import { useSelector } from "react-redux";
import EmptyState from "../../components/common/EmptyState";
import StageBadge from "../../components/domain/StageBadge";
import { PIPELINE_STAGES } from "../../constants/stages";
import { ROUTES } from "../../constants/routes";
import { selectAuthUser } from "../../store/slices/authSlice";
import { selectApplicationsByApplicant } from "../../store/slices/applicationsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import {
	applicationLastUpdated,
	nextStageLabel,
	stageEta,
	stageNarrative,
} from "../../utils/applicant";

function MyApplications() {
	const user = useSelector(selectAuthUser);
	const applications = useSelector(selectApplicationsByApplicant(user?.id));
	const jobs = useSelector(selectJobs);
	const jobById = new Map(jobs.map((job) => [job.id, job]));

	const active = applications.filter(
		(app) =>
			![
				PIPELINE_STAGES.REJECTED,
				PIPELINE_STAGES.HIRED,
				PIPELINE_STAGES.OFFER_SENT,
			].includes(app.currentStage),
	);
	const offers = applications.filter(
		(app) => app.currentStage === PIPELINE_STAGES.OFFER_SENT,
	);
	const archived = applications.filter(
		(app) => app.currentStage === PIPELINE_STAGES.HIRED,
	);
	const rejected = applications.filter(
		(app) => app.currentStage === PIPELINE_STAGES.REJECTED,
	);

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">My Applications</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
					Track every role in one calm place.
				</h1>
			</div>

			<div className="grid gap-3 sm:grid-cols-4">
				<Metric label="Active" value={active.length} />
				<Metric label="Offers" value={offers.length} />
				<Metric label="Archived" value={archived.length} />
				<Metric label="Rejected" value={rejected.length} />
			</div>

			<ApplicationGroup title="Active applications" apps={active} jobById={jobById} />
			<ApplicationGroup title="Offers received" apps={offers} jobById={jobById} />
			<ApplicationGroup title="Archived" apps={archived} jobById={jobById} />
			<ApplicationGroup title="Rejected" apps={rejected} jobById={jobById} />
		</div>
	);
}

function Metric({ label, value }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
			<p className="text-sm text-slate-500">{label}</p>
			<p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
		</div>
	);
}

function ApplicationGroup({ title, apps, jobById }) {
	if (!apps.length) {
		return (
			<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
				<div className="mt-4">
					<EmptyState
						title="Nothing here yet"
						description="When an application reaches this state, it will appear here."
					/>
				</div>
			</section>
		);
	}

	return (
		<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
			<div className="mt-4 space-y-3">
				{apps.map((app) => {
					const job = jobById.get(app.jobListingId);
					return (
						<Link
							key={app.id}
							to={ROUTES.APPLICANT_APPLICATION(app.id)}
							className="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
						>
							<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<p className="text-lg font-semibold text-slate-950">
										{job?.title ?? "Role"}
									</p>
									<p className="mt-1 text-sm text-slate-600">
										{stageNarrative(app.currentStage, job?.title ?? "this role")}
									</p>
								</div>
								<StageBadge stage={app.currentStage} />
							</div>
							<div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
								<p>Updated {applicationLastUpdated(app)}</p>
								<p>Next: {nextStageLabel(app.currentStage)}</p>
								<p>{stageEta(app.currentStage)}</p>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}

export default MyApplications;
