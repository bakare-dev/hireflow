import { useMemo } from "react";
import { useSelector } from "react-redux";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StageBadge from "../../components/domain/StageBadge";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectInterviewSlots } from "../../store/slices/interviewsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDateTime } from "../../utils/date";
import {
	kpiSnapshot,
	orderedFunnel,
	roleScopedApplications,
	roleScopedJobs,
} from "./recruitmentUtils";

function DashboardPage() {
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const interviews = useSelector(selectInterviewSlots);

	const scopedJobs = useMemo(
		() => roleScopedJobs(jobs, role, user),
		[jobs, role, user],
	);
	const scopedApps = useMemo(
		() => roleScopedApplications(applications, scopedJobs, role, user),
		[applications, scopedJobs, role, user],
	);
	const scopedInterviewIds = new Set(scopedApps.map((app) => app.id));
	const scopedInterviews = interviews.filter((slot) =>
		scopedInterviewIds.has(slot.applicationId),
	);

	const kpi = kpiSnapshot({
		jobs: scopedJobs,
		applications: scopedApps,
		interviews: scopedInterviews,
	});
	const funnelRows = orderedFunnel(kpi.funnel);
	const upcoming = [...scopedInterviews]
		.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
		.slice(0, 5);

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Operations"
				title="Recruitment Dashboard"
				description="Live operational snapshot of pipeline movement, interviews, offers, and AI signal quality."
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<KpiCard label="Open roles" value={kpi.openRoles} />
				<KpiCard label="Active candidates" value={kpi.activeCandidates} />
				<KpiCard label="Interviews this week" value={kpi.interviewsThisWeek} />
				<KpiCard label="Offers pending" value={kpi.offersPending} />
				<KpiCard label="Avg time-to-hire" value={`${kpi.avgTimeToHireDays} days`} />
				<KpiCard label="Hiring velocity" value={`${kpi.hiringVelocity}%`} />
			</div>

			<div className="grid gap-5 xl:grid-cols-3">
				<Card className="xl:col-span-1">
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Hiring Funnel</h2>
					</CardHeader>
					<CardBody className="space-y-3">
						{funnelRows.map((row) => (
							<div key={row.stage}>
								<div className="mb-1 flex items-center justify-between">
									<StageBadge stage={row.stage} />
									<span className="text-sm font-semibold text-slate-900">
										{row.value}
									</span>
								</div>
								<div className="h-2 rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-slate-700"
										style={{
											width: `${Math.max(
												8,
												Math.min(
													100,
													kpi.activeCandidates
														? (row.value / kpi.activeCandidates) * 100
														: 8,
												),
											)}%`,
										}}
									/>
								</div>
							</div>
						))}
					</CardBody>
				</Card>

				<Card className="xl:col-span-1">
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">AI Insights Feed</h2>
					</CardHeader>
					<CardBody className="space-y-3 text-sm text-slate-700">
						<p>Backend Engineer role has 16 strong matches in screening queue.</p>
						<p>Interview stage is creating most delays in current pipeline cycle.</p>
						<p>AI rejection rate increased for DevOps-related applications.</p>
						<p>Borderline candidates cluster around missing core backend skills.</p>
					</CardBody>
				</Card>

				<Card className="xl:col-span-1">
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Upcoming Interviews
						</h2>
					</CardHeader>
					<CardBody className="space-y-3">
						{upcoming.length ? (
							upcoming.map((slot) => (
								<div
									key={slot.id}
									className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
								>
									<p className="font-medium text-slate-900">
										Interview: {slot.applicationId}
									</p>
									<p className="text-slate-600">
										{formatDateTime(slot.scheduledAt)} · {slot.durationMinutes}m
									</p>
								</div>
							))
						) : (
							<p className="text-sm text-slate-600">No interviews scheduled.</p>
						)}
					</CardBody>
				</Card>
			</div>
		</div>
	);
}

function KpiCard({ label, value }) {
	return (
		<Card>
			<CardBody>
				<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
					{label}
				</p>
				<p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
			</CardBody>
		</Card>
	);
}

export default DashboardPage;
