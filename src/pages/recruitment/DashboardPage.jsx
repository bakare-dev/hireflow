import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import { STAGE_BADGE_COLORS, STAGE_LABELS } from "../../constants/stages";
import { USER_ROLES } from "../../constants/roles";
import { selectAuthRole } from "../../store/slices/authSlice";
import {
	useGetApplicationVolumeQuery,
	useGetTimeToHireQuery,
} from "../../api/adminApi";
import { useGetCompanyJobsQuery } from "../../api/jobsApi";

const STAGE_DISPLAY_ORDER = [
	"APPLIED",
	"SCREENING",
	"INTERVIEW_SCHEDULED",
	"INTERVIEW_COMPLETED",
	"OFFER",
	"OFFER_SENT",
	"HIRED",
	"REJECTED",
];

function DashboardPage() {
	const role = useSelector(selectAuthRole);
	const isAdmin = role === USER_ROLES.ADMIN;
	const [jobListingId, setJobListingId] = useState("");

	const { data: jobsResponse } = useGetCompanyJobsQuery(
		{ page: 0, size: 100 },
		{ skip: !isAdmin },
	);
	const jobs = useMemo(() => jobsResponse?.content ?? [], [jobsResponse]);

	const {
		data: volume,
		isLoading: volumeLoading,
		isError: volumeError,
		error: volumeErr,
	} = useGetApplicationVolumeQuery({ jobListingId }, { skip: !isAdmin });

	const {
		data: tth,
		isLoading: tthLoading,
		isError: tthError,
		error: tthErr,
	} = useGetTimeToHireQuery({ jobListingId }, { skip: !isAdmin });

	if (!isAdmin) {
		return (
			<div className="space-y-6">
				<PageHeader
					eyebrow="Operations"
					title="Recruitment Dashboard"
					description="Pipeline metrics and hiring velocity for your company."
				/>
				<Card>
					<CardBody>
						<EmptyState
							title="Admin-only metrics"
							description="Application volume and time-to-hire are exposed only to company admins. Ask an admin in your company for access, or use Job listings to track your own queues."
						/>
					</CardBody>
				</Card>
			</div>
		);
	}

	const funnelRows = orderedFunnel(volume?.volumeByStage);
	const totalApps = volume?.total ?? 0;

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Operations"
				title="Recruitment Dashboard"
				description="Live snapshot of pipeline movement and time-to-hire for your company."
				actions={
					<div className="w-64">
						<Select
							label="Scope"
							value={jobListingId}
							onChange={(e) => setJobListingId(e.target.value)}
							options={[
								{ value: "", label: "All job listings" },
								...jobs.map((j) => ({
									value: j.id,
									label: j.title,
								})),
							]}
						/>
					</div>
				}
			/>

			{/* --- Application volume --------------------------------------- */}
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<h2 className="text-sm font-semibold text-slate-900">
								Application volume
							</h2>
							<p className="mt-1 text-xs text-slate-500">
								Counts by stage{" "}
								{jobListingId
									? "for this listing"
									: "across every listing"}{" "}
								— refreshes on stage changes.
							</p>
						</div>
						<Badge className="bg-slate-100 text-slate-700 ring-slate-200">
							{totalApps} total
						</Badge>
					</div>
				</CardHeader>
				<CardBody>
					{volumeLoading ? (
						<p className="text-sm text-slate-500">
							Loading volume…
						</p>
					) : volumeError ? (
						<EmptyState
							title="Unable to load volume"
							description={
								volumeErr?.data?.message ??
								"Please retry in a moment."
							}
						/>
					) : funnelRows.length ? (
						<div className="space-y-3">
							{funnelRows.map((row) => {
								const pct =
									totalApps > 0
										? (row.value / totalApps) * 100
										: 0;
								return (
									<div key={row.stage}>
										<div className="mb-1 flex items-center justify-between">
											<Badge
												className={
													STAGE_BADGE_COLORS[
														row.stage
													] ??
													"bg-slate-100 text-slate-700 ring-slate-200"
												}
											>
												{STAGE_LABELS[row.stage] ??
													row.stage}
											</Badge>
											<span className="text-sm font-semibold text-slate-900">
												{row.value}{" "}
												<span className="text-xs font-normal text-slate-500">
													({pct.toFixed(0)}%)
												</span>
											</span>
										</div>
										<div className="h-2 rounded-full bg-slate-100">
											<div
												className="h-full rounded-full bg-slate-700"
												style={{
													width: `${Math.max(2, Math.min(100, pct))}%`,
												}}
											/>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<EmptyState
							title="No applications yet"
							description={
								jobListingId
									? "No one has applied to this listing yet."
									: "Once candidates apply, volume by stage shows here."
							}
						/>
					)}
				</CardBody>
			</Card>

			{/* --- Time to hire --------------------------------------------- */}
			<Card>
				<CardHeader>
					<div>
						<h2 className="text-sm font-semibold text-slate-900">
							Time-to-hire
						</h2>
						<p className="mt-1 text-xs text-slate-500">
							Hours between application and hire decision
							{jobListingId ? " for this listing" : ""}. Built
							from applications that reached <em>Hired</em>.
						</p>
					</div>
				</CardHeader>
				<CardBody>
					{tthLoading ? (
						<p className="text-sm text-slate-500">
							Loading time-to-hire…
						</p>
					) : tthError ? (
						<EmptyState
							title="Unable to load time-to-hire"
							description={
								tthErr?.data?.message ??
								"Please retry in a moment."
							}
						/>
					) : tth && tth.sampleSize > 0 ? (
						<div className="space-y-4">
							<div className="grid gap-3 sm:grid-cols-3">
								<Metric
									label="Sample size"
									value={tth.sampleSize}
								/>
								<Metric
									label="Mean"
									value={formatHours(tth.meanHours)}
								/>
								<Metric
									label="Median"
									value={formatHours(tth.medianHours)}
								/>
								<Metric
									label="p95"
									value={formatHours(tth.p95Hours)}
								/>
								<Metric
									label="Fastest"
									value={formatHours(tth.minHours)}
								/>
								<Metric
									label="Slowest"
									value={formatHours(tth.maxHours)}
								/>
							</div>
						</div>
					) : (
						<EmptyState
							title="Not enough hires yet"
							description="Once a few applications reach the Hired stage, this card will populate."
						/>
					)}
				</CardBody>
			</Card>
		</div>
	);
}

function orderedFunnel(volumeByStage) {
	if (!volumeByStage) return [];
	const seen = new Set();
	const rows = [];
	for (const stage of STAGE_DISPLAY_ORDER) {
		if (stage in volumeByStage) {
			rows.push({ stage, value: volumeByStage[stage] ?? 0 });
			seen.add(stage);
		}
	}
	for (const [stage, value] of Object.entries(volumeByStage)) {
		if (!seen.has(stage)) rows.push({ stage, value: value ?? 0 });
	}
	return rows;
}

function formatHours(hours) {
	if (hours == null) return "—";
	if (hours < 24) return `${hours}h`;
	const days = Math.round(hours / 24);
	return `${days}d`;
}

function Metric({ label, value }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 text-2xl font-semibold text-slate-950">
				{value}
			</p>
		</div>
	);
}

export default DashboardPage;
