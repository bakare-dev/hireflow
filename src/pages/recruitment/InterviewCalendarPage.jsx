import { useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { ROUTES } from "../../constants/routes";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectInterviewSlots } from "../../store/slices/interviewsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDateTime } from "../../utils/date";
import { getUserMap, roleScopedApplications, roleScopedJobs } from "./recruitmentUtils";

function InterviewCalendarPage() {
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const slots = useSelector(selectInterviewSlots);
	const [view, setView] = useState("agenda");
	const [focusDate, setFocusDate] = useState(() => {
		const now = new Date();
		return now.toISOString().slice(0, 10);
	});
	const users = getUserMap();
	const scopedJobs = roleScopedJobs(jobs, role, user);
	const scopedApps = roleScopedApplications(applications, scopedJobs, role, user);
	const appIds = new Set(scopedApps.map((app) => app.id));
	const appsById = new Map(scopedApps.map((app) => [app.id, app]));
	const jobsById = new Map(scopedJobs.map((job) => [job.id, job]));

	const scopedSlots = slots
		.filter((slot) => appIds.has(slot.applicationId))
		.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
	const focusTime = new Date(`${focusDate}T00:00:00`).getTime();
	const dayEnd = focusTime + 24 * 60 * 60 * 1000;
	const weekEnd = focusTime + 7 * 24 * 60 * 60 * 1000;
	const visibleSlots = scopedSlots.filter((slot) => {
		if (view === "agenda") return true;
		const time = new Date(slot.scheduledAt).getTime();
		if (view === "day") return time >= focusTime && time < dayEnd;
		return time >= focusTime && time < weekEnd;
	});

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Interviews"
				title="Interview Calendar"
				description="Plan and track interviews by day, week, and agenda-style queue."
				actions={
					<div className="flex flex-wrap gap-2">
						<input
							type="date"
							value={focusDate}
							onChange={(event) => setFocusDate(event.target.value)}
							className="h-9 rounded-md border border-slate-200 px-2 text-sm"
						/>
						<ViewButton active={view === "day"} onClick={() => setView("day")}>
							Day
						</ViewButton>
						<ViewButton active={view === "week"} onClick={() => setView("week")}>
							Week
						</ViewButton>
						<ViewButton
							active={view === "agenda"}
							onClick={() => setView("agenda")}
						>
							Agenda
						</ViewButton>
					</div>
				}
			/>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						{view[0].toUpperCase() + view.slice(1)} View
					</h2>
				</CardHeader>
				<CardBody className="space-y-3">
					{visibleSlots.length ? (
						visibleSlots.map((slot) => {
							const app = appsById.get(slot.applicationId);
							const job = jobsById.get(app?.jobListingId);
							const candidate = users.get(app?.applicantId);
							return (
								<div
									key={slot.id}
									className="rounded-lg border border-slate-200 p-4"
								>
									<div className="flex flex-wrap items-center justify-between gap-2">
										<div>
											<p className="font-medium text-slate-900">
												{candidate?.name ?? slot.applicationId}
											</p>
											<p className="text-sm text-slate-600">{job?.title}</p>
										</div>
										<div className="flex items-center gap-2">
											<Link to={ROUTES.INTERVIEW_FEEDBACK(slot.id)}>
												<Button variant="secondary" size="sm">
													Feedback
												</Button>
											</Link>
											{slot.meetLink ? (
												<a href={slot.meetLink} target="_blank" rel="noreferrer">
													<Button size="sm">Join link</Button>
												</a>
											) : null}
										</div>
									</div>
									<p className="mt-2 text-sm text-slate-700">
										{formatDateTime(slot.scheduledAt)} · {slot.durationMinutes}m
									</p>
								</div>
							);
						})
					) : (
						<p className="text-sm text-slate-600">
							No interviews scheduled for this {view} view.
						</p>
					)}
				</CardBody>
			</Card>
		</div>
	);
}

function ViewButton({ active, onClick, children }) {
	return (
		<Button variant={active ? "primary" : "secondary"} size="sm" onClick={onClick}>
			{children}
		</Button>
	);
}

export default InterviewCalendarPage;
