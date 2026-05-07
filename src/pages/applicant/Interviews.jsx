import { Link } from "react-router";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import { ROUTES } from "../../constants/routes";
import { selectAuthUser } from "../../store/slices/authSlice";
import { selectApplicationsByApplicant } from "../../store/slices/applicationsSlice";
import { selectInterviewSlots } from "../../store/slices/interviewsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDateTime } from "../../utils/date";

const DEMO_NOW_MS = new Date("2026-05-07T00:00:00.000Z").getTime();

function Interviews() {
	const user = useSelector(selectAuthUser);
	const applications = useSelector(selectApplicationsByApplicant(user?.id));
	const slots = useSelector(selectInterviewSlots);
	const jobs = useSelector(selectJobs);
	const appIds = new Set(applications.map((app) => app.id));
	const appById = new Map(applications.map((app) => [app.id, app]));
	const jobById = new Map(jobs.map((job) => [job.id, job]));
	const mySlots = slots
		.filter((slot) => appIds.has(slot.applicationId))
		.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

	const upcoming = mySlots.filter(
		(slot) => new Date(slot.scheduledAt).getTime() >= DEMO_NOW_MS,
	);
	const past = mySlots.filter(
		(slot) => new Date(slot.scheduledAt).getTime() < DEMO_NOW_MS,
	);

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Interviews</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
					Your interview plan.
				</h1>
			</div>

			<InterviewGroup
				title="Upcoming"
				slots={upcoming}
				appById={appById}
				jobById={jobById}
				empty="No upcoming interviews yet."
			/>
			<InterviewGroup
				title="Completed"
				slots={past}
				appById={appById}
				jobById={jobById}
				empty="Past interviews will appear here."
			/>
		</div>
	);
}

function InterviewGroup({ title, slots, appById, jobById, empty }) {
	return (
		<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
			{slots.length ? (
				<div className="mt-4 grid gap-4">
					{slots.map((slot) => {
						const application = appById.get(slot.applicationId);
						const job = jobById.get(application?.jobListingId);
						return (
							<article
								key={slot.id}
								className="rounded-lg border border-slate-200 p-4"
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p className="text-lg font-semibold text-slate-950">
											{job?.title ?? "Interview"}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{formatDateTime(slot.scheduledAt)} ·{" "}
											{slot.durationMinutes} minutes
										</p>
									</div>
									<Link to={ROUTES.APPLICANT_APPLICATION(slot.applicationId)}>
										<Button variant="secondary" size="sm">
											View application
										</Button>
									</Link>
								</div>
								<div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
									<p>Prep: review role skills and recent work examples.</p>
									<p>Reschedule: message the hiring team.</p>
									<p>
										{slot.reviewSubmittedAt
											? "Feedback submitted"
											: "Feedback pending"}
									</p>
								</div>
								{slot.meetLink ? (
									<a href={slot.meetLink} target="_blank" rel="noreferrer">
										<Button className="mt-4">Join link</Button>
									</a>
								) : null}
							</article>
						);
					})}
				</div>
			) : (
				<div className="mt-4">
					<EmptyState title={empty} description="We will show details here." />
				</div>
			)}
		</section>
	);
}

export default Interviews;
