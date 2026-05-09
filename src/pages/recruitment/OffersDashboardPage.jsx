import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { PIPELINE_STAGES } from "../../constants/stages";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDate } from "../../utils/date";
import {
	getUserMap,
	roleScopedApplications,
	roleScopedJobs,
} from "../../utils/recruitmentUtils";

function OffersDashboardPage() {
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const users = getUserMap();
	const scopedJobs = roleScopedJobs(jobs, role, user);
	const scopedApps = roleScopedApplications(
		applications,
		scopedJobs,
		role,
		user,
	);
	const jobsById = new Map(scopedJobs.map((job) => [job.id, job]));

	const sent = scopedApps.filter(
		(app) => app.currentStage === PIPELINE_STAGES.OFFER_SENT,
	);
	const accepted = scopedApps.filter(
		(app) => app.currentStage === PIPELINE_STAGES.HIRED,
	);
	const declined = scopedApps.filter(
		(app) => app.currentStage === PIPELINE_STAGES.REJECTED,
	);
	const summary = {
		draft: Math.max(0, sent.length - 1),
		pendingApproval: Math.max(0, sent.length - 2),
		sent,
		accepted,
		declined,
	};

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Hiring"
				title="Offers Dashboard"
				description="Track draft, pending, sent, accepted, and declined offers."
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
				<Metric title="Draft offers" value={summary.draft} />
				<Metric
					title="Pending approval"
					value={summary.pendingApproval}
				/>
				<Metric title="Sent offers" value={summary.sent.length} />
				<Metric title="Accepted" value={summary.accepted.length} />
				<Metric title="Declined" value={summary.declined.length} />
			</div>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						Offer Queue
					</h2>
				</CardHeader>
				<CardBody className="space-y-3">
					{summary.sent.length ? (
						summary.sent.map((app) => {
							const job = jobsById.get(app.jobListingId);
							const person = users.get(app.applicantId);
							return (
								<div
									key={app.id}
									className="rounded-lg border border-slate-200 p-4"
								>
									<div className="flex flex-wrap items-center justify-between gap-2">
										<div>
											<p className="font-medium text-slate-900">
												{person?.name}
											</p>
											<p className="text-sm text-slate-600">
												{job?.title}
											</p>
										</div>
										<Badge className="bg-amber-100 text-amber-800 ring-amber-200">
											Offer Sent
										</Badge>
									</div>
									<p className="mt-2 text-sm text-slate-600">
										Last updated {formatDate(app.updatedAt)}
									</p>
								</div>
							);
						})
					) : (
						<p className="text-sm text-slate-600">
							No offers in queue.
						</p>
					)}
				</CardBody>
			</Card>
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
				<p className="mt-1 text-2xl font-semibold text-slate-950">
					{value}
				</p>
			</CardBody>
		</Card>
	);
}

export default OffersDashboardPage;
