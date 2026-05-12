import { useMemo, useState } from "react";
import { Link } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import { JOB_STATUS_LABELS } from "../../constants/jobStatus";
import { EMPLOYMENT_TYPE_LABELS } from "../../constants/employment";
import { ROUTES } from "../../constants/routes";
import {
	useDeleteJobMutation,
	useGetCompanyJobsQuery,
} from "../../api/jobsApi";
import useToast from "../../hooks/useToast";

function JobListingsPage() {
	const toast = useToast();
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState("");
	const [pendingDelete, setPendingDelete] = useState(null);

	const { data: apiResponse, isLoading: isJobsLoading } =
		useGetCompanyJobsQuery({
			status: status || undefined,
			page: 0,
			size: 50,
		});

	const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();

	const jobs = useMemo(() => {
		return apiResponse?.content || [];
	}, [apiResponse?.content]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return jobs;
		return jobs.filter((job) =>
			`${job.title ?? ""} ${job.location ?? ""}`
				.toLowerCase()
				.includes(q),
		);
	}, [jobs, query]);

	async function handleConfirmDelete() {
		if (!pendingDelete) return;
		try {
			await deleteJob(pendingDelete.id).unwrap();
			toast.success("Job listing deleted.");
		} catch (err) {
			toast.error(err?.message ?? "Unable to delete job listing");
		} finally {
			setPendingDelete(null);
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Core Recruitment"
				title="Job Listings"
				description="Operational workspace for all active and historical listings."
				actions={
					<div className="flex items-center gap-2">
						<Link to={ROUTES.JOB_LISTING_NEW}>
							<Button size="sm">Create listing</Button>
						</Link>
					</div>
				}
			/>

			<Card>
				<CardBody className="grid gap-4 sm:grid-cols-2">
					<Input
						label="Search jobs"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Title or location"
					/>
					<Select
						label="Status"
						value={status}
						onChange={(event) => setStatus(event.target.value)}
						options={[
							{ value: "", label: "All statuses" },
							...Object.entries(JOB_STATUS_LABELS).map(
								([value, label]) => ({
									value,
									label,
								}),
							),
						]}
					/>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						All Listings
					</h2>
				</CardHeader>
				<div className="overflow-x-auto">
					{isJobsLoading ? (
						<EmptyState
							title="Loading job listings"
							description="Fetching your company's job listings..."
						/>
					) : filtered.length ? (
						<table className="min-w-full text-sm">
							<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
								<tr>
									<Th>Job title</Th>
									<Th>Type</Th>
									<Th>Auto-pass</Th>
									<Th>Auto-reject</Th>
									<Th>Status</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((job) => (
									<tr
										key={job.id}
										className="border-t border-slate-100 text-slate-700"
									>
										<Td>
											<p className="font-medium text-slate-900">
												{job.title}
											</p>
											<p className="text-xs text-slate-500">
												{job.location || "—"}
											</p>
										</Td>
										<Td>
											{EMPLOYMENT_TYPE_LABELS[job.type] ??
												job.type}
										</Td>
										<Td>
											{job.autoPassThreshold != null
												? `${job.autoPassThreshold}%`
												: "-"}
										</Td>
										<Td>
											{job.autoRejectThreshold != null
												? `${job.autoRejectThreshold}%`
												: "-"}
										</Td>
										<Td>
											<Badge className="bg-slate-100 text-slate-700 ring-slate-200">
												{JOB_STATUS_LABELS[job.status] ??
													job.status}
											</Badge>
										</Td>
										<Td>
											<div className="flex flex-wrap gap-2">
												<Link
													to={ROUTES.JOB_DETAIL(job.id)}
												>
													<Button
														variant="secondary"
														size="sm"
													>
														View
													</Button>
												</Link>
												<Link
													to={ROUTES.JOB_LISTING_EDIT(
														job.id,
													)}
												>
													<Button
														variant="secondary"
														size="sm"
													>
														Edit
													</Button>
												</Link>
												<Button
													variant="danger"
													size="sm"
													onClick={() =>
														setPendingDelete(job)
													}
													disabled={isDeleting}
												>
													Delete
												</Button>
											</div>
										</Td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<EmptyState
							title="No job listings found"
							description="Try adjusting your search or status filter."
						/>
					)}
				</div>
			</Card>

			<ConfirmModal
				open={Boolean(pendingDelete)}
				onClose={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
				title="Delete job listing?"
				description={
					pendingDelete
						? `This will permanently remove "${pendingDelete.title}". This action cannot be undone.`
						: ""
				}
				confirmButtonText="Delete"
				type="destructive"
			/>
		</div>
	);
}

function Th({ children }) {
	return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function Td({ children }) {
	return <td className="px-4 py-3 align-top">{children}</td>;
}

export default JobListingsPage;
