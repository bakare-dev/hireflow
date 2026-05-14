import { useMemo } from "react";
import { Link } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { ROUTES } from "../../constants/routes";
import { useGetMyApplicationsQuery } from "../../api/applicationsApi";
import { useGetInterviewQuery } from "../../api/interviewsApi";

const INTERVIEW_STATUS_STYLES = {
	SCHEDULED: "bg-teal-100 text-teal-700 ring-teal-200",
	COMPLETED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
	CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
	NO_SHOW: "bg-rose-100 text-rose-700 ring-rose-200",
};

const INTERVIEW_STATUS_LABELS = {
	SCHEDULED: "Scheduled",
	COMPLETED: "Completed",
	CANCELLED: "Cancelled",
	NO_SHOW: "No-show",
};

const STAGES_WITH_INTERVIEW = new Set([
	"INTERVIEW_SCHEDULED",
	"OFFER_SENT",
	"HIRED",
	"REJECTED",
]);

function Interviews() {
	const {
		data: response,
		isLoading,
		isError,
	} = useGetMyApplicationsQuery({
		page: 0,
		size: 50,
	});

	const applications = useMemo(() => response?.content ?? [], [response]);
	const relevant = useMemo(
		() =>
			applications.filter((app) => STAGES_WITH_INTERVIEW.has(app.stage)),
		[applications],
	);

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Interviews"
				title="Your interview plan"
				description="Every interview tied to one of your applications, with the meeting link and timing."
			/>

			{isLoading ? (
				<Card>
					<CardBody>
						<EmptyState
							title="Loading interviews"
							description="Fetching your applications…"
						/>
					</CardBody>
				</Card>
			) : isError ? (
				<Card>
					<CardBody>
						<EmptyState
							title="Unable to load interviews"
							description="Please refresh or try again in a moment."
						/>
					</CardBody>
				</Card>
			) : relevant.length ? (
				<div className="space-y-4">
					{relevant.map((app) => (
						<InterviewRow key={app.id} application={app} />
					))}
				</div>
			) : (
				<Card>
					<CardBody>
						<EmptyState
							title="No interviews yet"
							description="Once a recruiter schedules an interview, it'll show up here with the meeting link."
						/>
					</CardBody>
				</Card>
			)}
		</div>
	);
}

function InterviewRow({ application }) {
	const { id: applicationId, jobTitle, companyName, stage } = application;
	const {
		data: slot,
		isLoading,
		isError,
		error,
	} = useGetInterviewQuery(applicationId, { skip: !applicationId });

	const notFound =
		isError && (error?.status === 404 || error?.data?.status === 404);
	if (notFound) return null;

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div>
						<h2 className="text-base font-semibold text-slate-950">
							{jobTitle ?? "Interview"}
						</h2>
						<p className="mt-0.5 text-sm text-slate-500">
							{companyName ?? "—"}
						</p>
					</div>
					<div className="flex items-center gap-2">
						{slot?.status ? (
							<Badge
								className={
									INTERVIEW_STATUS_STYLES[slot.status] ??
									"bg-slate-100 text-slate-700 ring-slate-200"
								}
							>
								{INTERVIEW_STATUS_LABELS[slot.status] ??
									slot.status}
							</Badge>
						) : null}
						<Link to={ROUTES.APPLICANT_APPLICATION(applicationId)}>
							<Button size="sm" variant="secondary">
								View application
							</Button>
						</Link>
					</div>
				</div>
			</CardHeader>
			<CardBody>
				{isLoading ? (
					<p className="text-sm text-slate-500">
						Loading interview details…
					</p>
				) : isError ? (
					<p className="text-sm text-rose-600">
						Unable to load this interview.
					</p>
				) : slot ? (
					<div className="space-y-3">
						<div className="grid gap-3 sm:grid-cols-2">
							<Stat
								label="Starts"
								value={formatDateTime(
									slot.startTime,
									slot.timezone,
								)}
							/>
							<Stat
								label="Ends"
								value={formatDateTime(
									slot.endTime,
									slot.timezone,
								)}
							/>
							<Stat
								label="Timezone"
								value={slot.timezone ?? "—"}
							/>
							<Stat
								label="Interviewer"
								value={slot.interviewerEmail ?? "—"}
							/>
						</div>
						{slot.notes ? (
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Notes from the team
								</p>
								<p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
									{slot.notes}
								</p>
							</div>
						) : null}
						{slot.meetingLink && slot.status === "SCHEDULED" ? (
							<div>
								<a
									href={slot.meetingLink}
									target="_blank"
									rel="noreferrer"
								>
									<Button size="sm">Join meeting</Button>
								</a>
								<p className="mt-1 text-xs text-slate-500">
									{slot.meetingLink}
								</p>
							</div>
						) : slot.meetingLink ? (
							<a
								href={slot.meetingLink}
								target="_blank"
								rel="noreferrer"
								className="text-xs text-slate-500 underline"
							>
								Meeting link
							</a>
						) : null}
						{slot.status === "CANCELLED" ? (
							<p className="text-xs text-slate-500">
								This interview was cancelled. Your application
								is under review again.
							</p>
						) : null}
						{stage === "REJECTED" ? (
							<p className="text-xs text-slate-500">
								Application has since been closed.
							</p>
						) : null}
					</div>
				) : (
					<p className="text-sm text-slate-500">
						No interview details available yet.
					</p>
				)}
			</CardBody>
		</Card>
	);
}

function Stat({ label, value }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
		</div>
	);
}

function formatDateTime(iso, timezone) {
	if (!iso) return "—";
	try {
		return new Date(iso).toLocaleString(undefined, {
			timeZone: timezone || undefined,
			dateStyle: "medium",
			timeStyle: "short",
		});
	} catch {
		return new Date(iso).toLocaleString();
	}
}

export default Interviews;
