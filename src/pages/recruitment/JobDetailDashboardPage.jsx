import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import RichTextViewer from "../../components/editor/RichTextViewer";
import { JOB_STATUS_LABELS } from "../../constants/jobStatus";
import { EMPLOYMENT_TYPE_LABELS } from "../../constants/employment";
import { ROUTES } from "../../constants/routes";
import {
	useDeleteJobMutation,
	useGetJobQuery,
} from "../../api/jobsApi";
import useToast from "../../hooks/useToast";

function JobDetailDashboardPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const toast = useToast();

	const { data: job, isLoading, isError } = useGetJobQuery(id ?? "", {
		skip: !id,
	});
	const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function handleDelete() {
		try {
			await deleteJob(id).unwrap();
			toast.success("Job listing deleted.");
			navigate(ROUTES.JOB_LISTINGS);
		} catch (err) {
			toast.error(err?.message ?? "Unable to delete job listing");
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				<PageHeader
					title="Loading job"
					description="Fetching listing details..."
				/>
			</div>
		);
	}

	if (isError || !job) {
		return (
			<div className="space-y-4">
				<PageHeader
					title="Job not found"
					description="This listing may have been removed or is unavailable."
				/>
				<Link
					to={ROUTES.JOB_LISTINGS}
					className="text-sm text-slate-600 underline"
				>
					Back to listings
				</Link>
			</div>
		);
	}

	const statusLabel = JOB_STATUS_LABELS[job.status] ?? job.status;
	const typeLabel = EMPLOYMENT_TYPE_LABELS[job.type] ?? job.type;

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow={job.companyName ?? "Job"}
				title={job.title}
				description={`${job.location || "Location not set"} · ${typeLabel}`}
				actions={
					<div className="flex items-center gap-2">
						<Link to={ROUTES.JOB_LISTINGS}>
							<Button size="sm" variant="ghost">
								← Back to listings
							</Button>
						</Link>
						<Link to={ROUTES.JOB_APPLICATIONS(job.id)}>
							<Button size="sm" variant="secondary">
								View applications
							</Button>
						</Link>
						<Link to={ROUTES.JOB_LISTING_EDIT(job.id)}>
							<Button size="sm" variant="secondary">
								Edit
							</Button>
						</Link>
						<Button
							size="sm"
							variant="danger"
							onClick={() => setConfirmOpen(true)}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</div>
				}
			/>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-semibold text-slate-900">
							Overview
						</h2>
						<Badge className="bg-slate-100 text-slate-700 ring-slate-200">
							{statusLabel}
						</Badge>
					</div>
				</CardHeader>
				<CardBody className="grid gap-4 sm:grid-cols-3">
					<Metric title="Type" value={typeLabel} />
					<Metric
						title="Auto-reject threshold"
						value={`${job.autoRejectThreshold ?? "-"}%`}
					/>
					<Metric
						title="Auto-pass threshold"
						value={`${job.autoPassThreshold ?? "-"}%`}
					/>
				</CardBody>
			</Card>

			<div className="grid gap-5 xl:grid-cols-2">
				<Section title="Summary" html={job.summary} />
				<Section title="Responsibilities" html={job.responsibilities} />
				<Section
					title="Required Qualifications"
					html={job.requiredQualifications}
				/>
				<Section
					title="Preferred Qualifications"
					html={job.preferredQualifications}
				/>
			</div>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						Skills
					</h2>
				</CardHeader>
				<CardBody>
					{job.skills?.length ? (
						<div className="flex flex-wrap gap-2">
							{job.skills.map((skill) => (
								<span
									key={skill.id}
									className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
								>
									{skill.name}
								</span>
							))}
						</div>
					) : (
						<EmptyState
							title="No skills attached"
							description="Edit this listing to attach required skills."
						/>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<div>
						<h2 className="text-sm font-semibold text-slate-900">
							Screening Questions
						</h2>
						<p className="mt-1 text-xs text-slate-500">
							Role-specific questions used by the AI during
							screening. Ideal answers are stored privately and not
							shown here.
						</p>
					</div>
				</CardHeader>
				<CardBody>
					{job.questions?.length ? (
						<ol className="space-y-2">
							{job.questions.map((q, index) => (
								<li
									key={q.id ?? index}
									className="rounded-md border border-slate-200 bg-slate-50 p-3"
								>
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										Question {index + 1}
									</p>
									<p className="mt-1 text-sm text-slate-800">
										{q.question}
									</p>
								</li>
							))}
						</ol>
					) : (
						<EmptyState
							title="No screening questions"
							description="Edit this listing to add role-specific screening questions."
						/>
					)}
				</CardBody>
			</Card>

			<ConfirmModal
				open={confirmOpen}
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleDelete}
				title="Delete job listing?"
				description={`This will permanently remove "${job.title}". This action cannot be undone.`}
				confirmButtonText="Delete"
				type="destructive"
			/>
		</div>
	);
}

function Metric({ title, value }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
				{title}
			</p>
			<p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
		</div>
	);
}

function Section({ title, html }) {
	return (
		<Card>
			<CardHeader>
				<h2 className="text-sm font-semibold text-slate-900">{title}</h2>
			</CardHeader>
			<CardBody>
				{html ? (
					<RichTextViewer content={html} />
				) : (
					<p className="text-sm text-slate-500">Not provided.</p>
				)}
			</CardBody>
		</Card>
	);
}

export default JobDetailDashboardPage;
