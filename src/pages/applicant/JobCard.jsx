import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import StageBadge from "../../components/domain/StageBadge";
import { cn } from "../../utils/classnames";
import {
	applicationLastUpdated,
	applicationStatusText,
	computeMatchPercent,
	employmentTypeLabel,
	formatSalary,
	isRemote,
	postedLabel,
	workModeLabel,
} from "../../utils/applicant";

function JobCard({
	job,
	user,
	application,
	selected,
	saved,
	onSelect,
	onApply,
	onToggleSave,
}) {
	const match = computeMatchPercent(job, user);

	return (
		<article
			className={cn(
				"rounded-lg border bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md",
				selected
					? "border-slate-950 ring-2 ring-slate-950/5"
					: "border-slate-200",
			)}
		>
			<button type="button" onClick={onSelect} className="block w-full text-left">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h2 className="text-lg font-semibold leading-snug text-slate-950">
							{job.title}
						</h2>
						<p className="mt-1 text-sm text-slate-600">Acme Labs</p>
					</div>
					<Badge className="shrink-0 bg-emerald-50 text-emerald-700 ring-emerald-200">
						{match}% match
					</Badge>
				</div>

				<div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
					<span>{job.location}</span>
					<span aria-hidden>·</span>
					<span>{workModeLabel(job.workMode)}</span>
					<span aria-hidden>·</span>
					<span>{employmentTypeLabel(job.employmentType)}</span>
				</div>

				<p className="mt-2 text-sm font-medium text-slate-950">
					{formatSalary(job.salary)}
				</p>

				<div className="mt-3 flex flex-wrap gap-2">
					{isRemote(job) ? (
						<Badge className="bg-blue-50 text-blue-700 ring-blue-200">
							Remote
						</Badge>
					) : null}
					{job.requiredSkills.slice(0, 3).map((skill) => (
						<Badge
							key={skill}
							className="bg-slate-50 text-slate-700 ring-slate-200"
						>
							{skill}
						</Badge>
					))}
				</div>

				<MatchPercentBar value={match} className="mt-4" showValue={false} />

				{application ? (
					<div className="mt-4 rounded-lg bg-slate-50 p-3">
						<div className="flex flex-wrap items-center gap-2">
							<StageBadge stage={application.currentStage} />
							<span className="text-xs text-slate-500">
								Updated {applicationLastUpdated(application)}
							</span>
						</div>
						<p className="mt-1 text-xs text-slate-600">
							{applicationStatusText(application)}
						</p>
					</div>
				) : (
					<p className="mt-4 text-xs text-slate-500">
						{postedLabel(job.createdAt)}
					</p>
				)}
			</button>

			<div className="mt-4 flex items-center gap-2">
				<Button
					size="sm"
					onClick={onApply}
					disabled={!!application}
					className="flex-1"
				>
					{application ? "Applied" : "Easy apply"}
				</Button>
				<Button variant="secondary" size="sm" onClick={onToggleSave}>
					{saved ? "Saved" : "Save"}
				</Button>
			</div>
		</article>
	);
}

export default JobCard;
