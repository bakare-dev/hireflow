import { useMemo } from "react";
import { Link, useParams } from "react-router";
import EmptyState from "../../components/common/EmptyState";
import StageBadge from "../../components/domain/StageBadge";
import { ROUTES } from "../../constants/routes";
import { STAGE_LABELS } from "../../constants/stages";
import { useGetMyApplicationQuery } from "../../api/applicationsApi";
import { formatDate, formatDateTime } from "../../utils/date";
import {
	nextStageLabel,
	stageEta,
	stageNarrative,
} from "../../utils/applicant";

function ApplicationDetail() {
	const { id } = useParams();
	const {
		data: application,
		isLoading,
		isError,
		error,
	} = useGetMyApplicationQuery(id ?? "", { skip: !id });

	const timeline = useMemo(() => {
		const updates = application?.stageUpdates ?? [];
		return [...updates].sort((a, b) => {
			const at = new Date(a.createdAt).getTime();
			const bt = new Date(b.createdAt).getTime();
			return at - bt;
		});
	}, [application?.stageUpdates]);

	if (isLoading) {
		return (
			<EmptyState
				title="Loading application"
				description="Fetching the latest status..."
			/>
		);
	}

	if (isError || !application) {
		return (
			<EmptyState
				title={
					error?.status === 404
						? "Application not found"
						: "Unable to load application"
				}
				description={
					error?.message ??
					"This application may no longer be available."
				}
			/>
		);
	}

	const jobTitle = application.jobTitle ?? "Role";
	const companyName = application.companyName ?? "Company";

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
						<p className="text-sm text-slate-500">{companyName}</p>
						<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
							{jobTitle}
						</h1>
						<p className="mt-3 text-base text-slate-700">
							{stageNarrative(application.stage, jobTitle)}
						</p>
					</div>
					<StageBadge stage={application.stage} />
				</div>

				<div className="mt-6 grid gap-3 sm:grid-cols-3">
					<Info
						label="Applied on"
						value={formatDate(application.createdAt)}
					/>
					<Info
						label="Last update"
						value={formatDate(application.updatedAt)}
					/>
					<Info
						label="Next step"
						value={
							nextStageLabel(application.stage) ||
							stageEta(application.stage)
						}
					/>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-slate-950">
						Application timeline
					</h2>
					<div className="mt-5 space-y-4">
						{timeline.length ? (
							timeline.map((update, index) => (
								<div key={update.id} className="flex gap-4">
									<div className="flex flex-col items-center">
										<span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
											{index + 1}
										</span>
										{index < timeline.length - 1 ? (
											<span className="h-full w-px bg-slate-200" />
										) : null}
									</div>
									<div className="pb-5">
										<p className="font-semibold text-slate-950">
											{STAGE_LABELS[
												update.currentStage
											] ?? update.currentStage}
										</p>
										<p className="mt-1 text-sm text-slate-600">
											{formatDateTime(update.createdAt)}
											{update.actor
												? ` · ${update.actor}`
												: ""}
										</p>
										{update.previousStage ? (
											<p className="mt-2 text-sm text-slate-700">
												Moved from{" "}
												{STAGE_LABELS[
													update.previousStage
												] ?? update.previousStage}
											</p>
										) : null}
										{update.reason ? (
											<p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
												{update.reason}
											</p>
										) : null}
									</div>
								</div>
							))
						) : (
							<EmptyState
								title="Timeline is starting"
								description="The first update will appear here as your application progresses."
							/>
						)}
					</div>
				</section>
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
