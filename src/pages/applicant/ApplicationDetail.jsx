import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import StageBadge from "../../components/domain/StageBadge";
import { ROUTES } from "../../constants/routes";
import { STAGE_LABELS } from "../../constants/stages";
import {
	fetchStageUpdates,
	selectApplicationById,
	selectStageUpdatesFor,
} from "../../store/slices/applicationsSlice";
import { selectSlotByApplication } from "../../store/slices/interviewsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDateTime } from "../../utils/date";
import {
	applicationLastUpdated,
	computeMatchPercent,
	interviewerLabel,
	interviewTime,
	matchSkills,
	nextStageLabel,
	stageEta,
	stageNarrative,
} from "../../utils/applicant";
import { selectAuthUser } from "../../store/slices/authSlice";

function ApplicationDetail() {
	const { id } = useParams();
	const dispatch = useDispatch();
	const user = useSelector(selectAuthUser);
	const application = useSelector(selectApplicationById(id));
	const updates = useSelector(selectStageUpdatesFor(id));
	const slot = useSelector(selectSlotByApplication(id));
	const jobs = useSelector(selectJobs);
	const job = jobs.find((item) => item.id === application?.jobListingId);
	const match = computeMatchPercent(job, user);
	const skills = matchSkills(job, user);
	const latestReason = [...updates].reverse().find((update) => update.reason);

	useEffect(() => {
		if (id) dispatch(fetchStageUpdates(id));
	}, [dispatch, id]);

	if (!application || !job) {
		return (
			<EmptyState
				title="Application not found"
				description="This application may no longer be available."
			/>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<Link
				to={ROUTES.APPLICANT_APPLICATIONS}
				className="text-sm font-medium text-slate-600 hover:text-slate-950"
			>
				Back to applications
			</Link>

			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="text-sm text-slate-500">Acme Labs</p>
						<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
							{job.title}
						</h1>
						<p className="mt-3 text-base text-slate-700">
							{stageNarrative(application.currentStage, job.title)}
						</p>
					</div>
					<StageBadge stage={application.currentStage} />
				</div>

				<div className="mt-6 grid gap-3 sm:grid-cols-3">
					<Info label="Last update" value={applicationLastUpdated(application)} />
					<Info label="Next step" value={nextStageLabel(application.currentStage)} />
					<Info label="ETA" value={stageEta(application.currentStage)} />
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-slate-950">
						Application timeline
					</h2>
					<div className="mt-5 space-y-4">
						{updates.length ? (
							updates.map((update, index) => (
								<div key={update.id} className="flex gap-4">
									<div className="flex flex-col items-center">
										<span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
											{index + 1}
										</span>
										{index < updates.length - 1 ? (
											<span className="h-full w-px bg-slate-200" />
										) : null}
									</div>
									<div className="pb-5">
										<p className="font-semibold text-slate-950">
											{STAGE_LABELS[update.currentStage] ?? update.currentStage}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{formatDateTime(update.occurredAt)}
										</p>
										<p className="mt-2 text-sm text-slate-700">
											{update.nextStage
												? `Next expected step: ${STAGE_LABELS[update.nextStage]}`
												: "This is a final application state."}
										</p>
										{update.reason ? (
											<p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
												{update.reason}
											</p>
										) : null}
									</div>
								</div>
							))
						) : (
							<EmptyState
								title="Timeline is starting"
								description="The first update will appear here as the dummy service records it."
							/>
						)}
					</div>
				</section>

				<aside className="space-y-5">
					<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-950">
							Review details
						</h2>
						<div className="mt-4 space-y-3 text-sm text-slate-700">
							<p>Reviewer: {interviewerLabel(slot)}</p>
							<p>Fit score: {match}%</p>
							<p>Matched: {skills.matched.join(", ") || "Review pending"}</p>
							<p>
								May be reviewed:{" "}
								{skills.unmatched.join(", ") || "No clear gaps in profile"}
							</p>
						</div>
					</section>

					<section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-950">Interview</h2>
						<p className="mt-3 text-sm text-slate-700">{interviewTime(slot)}</p>
						{slot?.meetLink ? (
							<a href={slot.meetLink} target="_blank" rel="noreferrer">
								<Button className="mt-4 w-full">Join interview</Button>
							</a>
						) : (
							<p className="mt-3 text-sm text-slate-500">
								No interview is scheduled yet.
							</p>
						)}
					</section>

					{latestReason ? (
						<section className="rounded-xl border border-rose-200 bg-rose-50 p-5">
							<h2 className="text-lg font-semibold text-rose-950">
								Decision reason
							</h2>
							<p className="mt-3 text-sm leading-6 text-rose-800">
								{latestReason.reason}
							</p>
						</section>
					) : null}
				</aside>
			</div>
		</div>
	);
}

function Info({ label, value }) {
	return (
		<div className="rounded-lg bg-slate-50 p-4">
			<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
		</div>
	);
}

export default ApplicationDetail;
