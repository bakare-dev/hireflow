import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import StageBadge from "../../components/domain/StageBadge";
import { ROUTES } from "../../constants/routes";
import { selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectJobById } from "../../store/slices/jobsSlice";
import {
	applicationForJob,
	applicationLastUpdated,
	computeMatchPercent,
	employmentTypeLabel,
	formatSalary,
	matchSkills,
	nextStageLabel,
	stageEta,
	workModeLabel,
} from "../../utils/applicant";
import ApplyModal from "./ApplyModal";

function JobDetail() {
	const { id } = useParams();
	const user = useSelector(selectAuthUser);
	const job = useSelector(selectJobById(id));
	const applications = useSelector(selectApplications);
	const [applyOpen, setApplyOpen] = useState(false);

	const application = job
		? applicationForJob(applications, job.id, user?.id)
		: null;
	const match = useMemo(() => computeMatchPercent(job, user), [job, user]);
	const skills = useMemo(() => matchSkills(job, user), [job, user]);

	if (!job) {
		return (
			<EmptyState
				title="Job not found"
				description="This role may have moved or closed."
			/>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<Link
				to={ROUTES.APPLICANT_JOBS}
				className="text-sm font-medium text-slate-600 hover:text-slate-950"
			>
				Back to jobs
			</Link>

			<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<p className="text-sm text-slate-500">Acme Labs</p>
						<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
							{job.title}
						</h1>
						<p className="mt-3 text-base text-slate-600">
							{job.location} · {workModeLabel(job.workMode)} ·{" "}
							{employmentTypeLabel(job.employmentType)}
						</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<Badge className="bg-slate-50 text-slate-700 ring-slate-200">
								{formatSalary(job.salary)}
							</Badge>
							<Badge className="bg-blue-50 text-blue-700 ring-blue-200">
								Estimated response: 3-5 days
							</Badge>
							<Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">
								Easy Apply
							</Badge>
						</div>
					</div>

					<div className="w-full rounded-xl border border-slate-200 p-4 lg:w-72">
						<p className="text-sm font-semibold text-slate-950">Your fit</p>
						<MatchPercentBar value={match} className="mt-3" />
						<p className="mt-3 text-sm text-slate-600">
							{skills.matched.length} of {job.requiredSkills.length} required
							skills appear in your profile.
						</p>
					</div>
				</div>
			</section>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
				<main className="space-y-5">
					<Section title="Job overview">
						<p>{job.description}</p>
					</Section>

					<Section title="Responsibilities">
						<ul className="space-y-2">
							<li>Own product-quality work from idea through release.</li>
							<li>Partner closely with product, design, and hiring stakeholders.</li>
							<li>Improve the candidate experience with thoughtful details.</li>
						</ul>
					</Section>

					<Section title="Requirements">
						<div className="flex flex-wrap gap-2">
							{job.requiredSkills.map((skill) => (
								<Badge
									key={skill}
									className="bg-slate-50 text-slate-700 ring-slate-200"
								>
									{skill}
								</Badge>
							))}
						</div>
					</Section>

					<Section title="Benefits">
						<ul className="space-y-2">
							<li>Flexible working rhythm based on role and team needs.</li>
							<li>Clear hiring updates through the HireFlow application tracker.</li>
							<li>Structured interviews so every candidate knows what comes next.</li>
						</ul>
					</Section>

					<Section title="Team and company">
						<p>
							Acme Labs is building thoughtful hiring workflows for modern teams.
							The team values clarity, speed, and respectful candidate
							communication.
						</p>
					</Section>

					<Section title="Hiring process preview">
						<div className="grid gap-3 sm:grid-cols-4">
							{["Apply", "Screening", "Interview", "Offer"].map((step) => (
								<div
									key={step}
									className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700"
								>
									{step}
								</div>
							))}
						</div>
					</Section>
				</main>

				<aside className="lg:sticky lg:top-20 lg:self-start">
					<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
						{application ? (
							<div className="space-y-3">
								<StageBadge stage={application.currentStage} />
								<p className="text-sm font-semibold text-slate-950">
									Applied {applicationLastUpdated(application)}
								</p>
								<p className="text-sm text-slate-600">
									Next: {nextStageLabel(application.currentStage)}
								</p>
								<p className="text-sm text-slate-600">
									{stageEta(application.currentStage)}
								</p>
								<Link to={ROUTES.APPLICANT_APPLICATION(application.id)}>
									<Button variant="secondary" className="mt-2 w-full">
										Track application
									</Button>
								</Link>
							</div>
						) : (
							<div className="space-y-3">
								<Button className="w-full" onClick={() => setApplyOpen(true)}>
									Apply now
								</Button>
								<Button variant="secondary" className="w-full">
									Save job
								</Button>
								<p className="text-xs leading-5 text-slate-500">
									Quick apply uses your seeded profile and should take less than
									two minutes in this prototype.
								</p>
							</div>
						)}
					</div>
				</aside>
			</div>

			<ApplyModal
				job={job}
				open={applyOpen}
				onClose={() => setApplyOpen(false)}
				existingApplication={application}
			/>
		</div>
	);
}

function Section({ title, children }) {
	return (
		<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 className="text-lg font-semibold text-slate-950">{title}</h2>
			<div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
		</section>
	);
}

export default JobDetail;
