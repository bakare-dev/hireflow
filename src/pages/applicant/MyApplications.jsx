import { useMemo } from "react";
import { Link } from "react-router";
import EmptyState from "../../components/common/EmptyState";
import StageBadge from "../../components/domain/StageBadge";
import { ROUTES } from "../../constants/routes";
import { useGetMyApplicationsQuery } from "../../api/applicationsApi";
import { formatDate } from "../../utils/date";

const ACTIVE_STAGES = new Set([
	"APPLIED",
	"AI_SCREENING",
	"AI_PASSED",
	"UNDER_REVIEW",
	"SHORTLISTED",
	"INTERVIEW",
]);
const OFFER_STAGES = new Set(["OFFER"]);
const ARCHIVED_STAGES = new Set(["HIRED"]);
const REJECTED_STAGES = new Set([
	"REJECTED",
	"AI_REJECTED",
	"WITHDRAWN",
]);

function MyApplications() {
	const {
		data: apiResponse,
		isLoading,
		isError,
	} = useGetMyApplicationsQuery({ page: 0, size: 50 });

	const applications = useMemo(
		() => apiResponse?.content ?? [],
		[apiResponse?.content],
	);

	const grouped = useMemo(() => {
		const active = [];
		const offers = [];
		const archived = [];
		const rejected = [];
		for (const app of applications) {
			if (OFFER_STAGES.has(app.stage)) offers.push(app);
			else if (ARCHIVED_STAGES.has(app.stage)) archived.push(app);
			else if (REJECTED_STAGES.has(app.stage)) rejected.push(app);
			else if (ACTIVE_STAGES.has(app.stage)) active.push(app);
			else active.push(app);
		}
		return { active, offers, archived, rejected };
	}, [applications]);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Header />
				<EmptyState
					title="Loading your applications"
					description="Fetching the latest stages from the server..."
				/>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="space-y-6">
				<Header />
				<EmptyState
					title="We could not load your applications"
					description="Please try again in a moment."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Header />

			<div className="grid gap-3 sm:grid-cols-4">
				<Metric label="Active" value={grouped.active.length} />
				<Metric label="Offers" value={grouped.offers.length} />
				<Metric label="Archived" value={grouped.archived.length} />
				<Metric label="Rejected" value={grouped.rejected.length} />
			</div>

			<ApplicationGroup
				title="Active applications"
				apps={grouped.active}
			/>
			<ApplicationGroup title="Offers received" apps={grouped.offers} />
			<ApplicationGroup title="Archived" apps={grouped.archived} />
			<ApplicationGroup title="Rejected" apps={grouped.rejected} />
		</div>
	);
}

function Header() {
	return (
		<div>
			<p className="text-sm font-medium text-slate-500">My Applications</p>
			<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
				Track every role in one calm place.
			</h1>
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

function ApplicationGroup({ title, apps }) {
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
				{apps.map((app) => (
					<Link
						key={app.id}
						to={ROUTES.APPLICANT_APPLICATION(app.id)}
						className="block rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
					>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-lg font-semibold text-slate-950">
									{app.jobTitle ?? "Role"}
								</p>
								<p className="mt-1 text-sm text-slate-600">
									{app.companyName ?? "Company"}
								</p>
							</div>
							<StageBadge stage={app.stage} />
						</div>
						<div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
							<p>Applied {formatDate(app.createdAt)}</p>
							<p>Updated {formatDate(app.updatedAt)}</p>
							{app.screeningResult?.matchPercentage != null ? (
								<p>
									AI match: {app.screeningResult.matchPercentage}%
								</p>
							) : (
								<p>AI screening pending</p>
							)}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}

export default MyApplications;
