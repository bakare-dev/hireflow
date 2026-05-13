import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import Select from "../../components/common/Select";
import { ROUTES } from "../../constants/routes";
import {
	SCREENING_RECOMMENDATION_BADGE_COLORS,
	SCREENING_RECOMMENDATION_LABELS,
	STAGE_BADGE_COLORS,
	STAGE_LABELS,
	STAGE_TARGET_OPTIONS,
} from "../../constants/stages";
import {
	useBulkUpdateApplicationStagesMutation,
	useGetJobApplicationsQuery,
} from "../../api/applicationsApi";
import { useGetJobQuery } from "../../api/jobsApi";
import useToast from "../../hooks/useToast";

const PAGE_SIZE = 10;

const RECOMMENDATION_OPTIONS = [
	{ value: "", label: "All recommendations" },
	{ value: "PENDING", label: "Pending" },
	{ value: "AUTO_PASS", label: "Auto pass" },
	{ value: "MANUAL_REVIEW", label: "Manual review" },
	{ value: "AUTO_REJECT", label: "Auto reject" },
];

function JobApplicationsPage() {
	const toast = useToast();
	const { id } = useParams();
	const jobId = id ?? "";
	const [page, setPage] = useState(0);
	const [recommendation, setRecommendation] = useState("");
	// Selection lives across pages, keyed by application id, so a recruiter
	// can paginate and still batch the whole result.
	const [selected, setSelected] = useState(() => new Set());
	const [bulkOpen, setBulkOpen] = useState(false);

	const { data: job } = useGetJobQuery(jobId, { skip: !jobId });
	const {
		data: response,
		isLoading,
		isFetching,
		isError,
		error,
	} = useGetJobApplicationsQuery(
		{ jobId, page, size: PAGE_SIZE, recommendation },
		{ skip: !jobId },
	);
	const [bulkUpdate, { isLoading: isBulkUpdating }] =
		useBulkUpdateApplicationStagesMutation();

	const applications = useMemo(() => response?.content ?? [], [response]);
	const pageable = response?.pageable;
	const totalPages = pageable?.totalPages ?? 1;
	const totalElements = pageable?.totalElements ?? applications.length;

	// Reset paging + selection when the filter changes so the user never sees
	// the wrong page index for the new dataset.
	useEffect(() => {
		setPage(0);
	}, [recommendation]);

	const pageIds = useMemo(
		() => applications.map((a) => a.id),
		[applications],
	);
	const allPageSelected =
		pageIds.length > 0 && pageIds.every((id) => selected.has(id));
	const somePageSelected = pageIds.some((id) => selected.has(id));

	function toggleRow(id) {
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function togglePage() {
		setSelected((current) => {
			const next = new Set(current);
			if (allPageSelected) {
				pageIds.forEach((id) => next.delete(id));
			} else {
				pageIds.forEach((id) => next.add(id));
			}
			return next;
		});
	}

	function clearSelection() {
		setSelected(new Set());
	}

	async function handleBulkSubmit({ targetStage, reason }) {
		const ids = Array.from(selected);
		if (!ids.length) return;
		try {
			const result = await bulkUpdate({
				applicationIds: ids,
				targetStage,
				reason: reason?.trim() || undefined,
			}).unwrap();
			const { succeeded = 0, failed = 0, failures = [] } = result ?? {};
			toast.success(
				`Updated ${succeeded} of ${ids.length}${
					failed ? ` (${failed} failed)` : ""
				}.`,
			);
			if (failures.length && import.meta.env.DEV) {
				console.warn("[bulk update] per-id failures", failures);
			}
			setBulkOpen(false);
			clearSelection();
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to bulk-update applications.",
			);
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow={job?.companyName ?? "Applications"}
				title={
					job?.title
						? `Applications · ${job.title}`
						: "Job Applications"
				}
				description={`Candidates who applied to this listing${
					totalElements ? ` (${totalElements} total)` : ""
				}.`}
				actions={
					<div className="flex items-center gap-2">
						<Link to={ROUTES.JOB_DETAIL(jobId)}>
							<Button size="sm" variant="secondary">
								Back to listing
							</Button>
						</Link>
					</div>
				}
			/>

			<Card>
				<CardBody className="grid gap-4 sm:grid-cols-2">
					<Select
						label="Recommendation"
						value={recommendation}
						onChange={(e) => setRecommendation(e.target.value)}
						options={RECOMMENDATION_OPTIONS}
					/>
				</CardBody>
			</Card>

			{selected.size > 0 ? (
				<div className="sticky top-2 z-20 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-900 bg-slate-950 px-4 py-3 text-sm text-white shadow-lg">
					<div>
						<span className="font-semibold">{selected.size}</span>{" "}
						selected{" "}
						<span className="text-slate-400">
							across this job
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="secondary"
							onClick={clearSelection}
						>
							Clear
						</Button>
						<Button size="sm" onClick={() => setBulkOpen(true)}>
							Update stage
						</Button>
					</div>
				</div>
			) : null}

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						All Applications
					</h2>
				</CardHeader>
				<div className="overflow-x-auto">
					{isLoading ? (
						<EmptyState
							title="Loading applications"
							description="Fetching candidates for this listing..."
						/>
					) : isError ? (
						<EmptyState
							title="Unable to load applications"
							description={
								error?.data?.message ??
								error?.message ??
								"Please try again or refresh the page."
							}
						/>
					) : applications.length ? (
						<table className="min-w-full text-sm">
							<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
								<tr>
									<Th className="w-10">
										<input
											type="checkbox"
											aria-label="Select all on this page"
											checked={allPageSelected}
											ref={(el) => {
												if (el) {
													el.indeterminate =
														!allPageSelected && somePageSelected;
												}
											}}
											onChange={togglePage}
										/>
									</Th>
									<Th>Applicant</Th>
									<Th>Stage</Th>
									<Th>Recommendation</Th>
									<Th>Match</Th>
									<Th>Submitted</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody>
								{applications.map((app) => {
									const rec = app.screeningResult?.recommendation;
									const match = app.screeningResult?.matchPercentage;
									return (
										<tr
											key={app.id}
											className="border-t border-slate-100 text-slate-700"
										>
											<Td>
												<input
													type="checkbox"
													aria-label={`Select ${app.applicantName ?? "applicant"}`}
													checked={selected.has(app.id)}
													onChange={() => toggleRow(app.id)}
												/>
											</Td>
											<Td>
												<p className="font-medium text-slate-900">
													{app.applicantName ?? "—"}
												</p>
												<p className="text-xs text-slate-500">
													{app.applicantEmail ?? "—"}
												</p>
											</Td>
											<Td>
												<Badge
													className={
														STAGE_BADGE_COLORS[app.stage] ??
														"bg-slate-100 text-slate-700 ring-slate-200"
													}
												>
													{STAGE_LABELS[app.stage] ?? app.stage}
												</Badge>
											</Td>
											<Td>
												{rec ? (
													<Badge
														className={
															SCREENING_RECOMMENDATION_BADGE_COLORS[
																rec
															] ??
															"bg-slate-100 text-slate-700 ring-slate-200"
														}
													>
														{SCREENING_RECOMMENDATION_LABELS[rec] ??
															rec}
													</Badge>
												) : (
													"—"
												)}
											</Td>
											<Td>
												{match != null ? `${match}%` : "—"}
											</Td>
											<Td>
												{app.createdAt
													? new Date(
															app.createdAt,
														).toLocaleDateString()
													: "—"}
											</Td>
											<Td>
												<Link
													to={ROUTES.JOB_APPLICATION_DETAIL(
														jobId,
														app.id,
													)}
												>
													<Button size="sm" variant="secondary">
														View
													</Button>
												</Link>
											</Td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						<EmptyState
							title="No applications match"
							description={
								recommendation
									? "Try clearing the recommendation filter."
									: "Candidates who apply to this listing will appear here."
							}
						/>
					)}
				</div>
				{applications.length ? (
					<CardBody className="flex items-center justify-between border-t border-slate-100">
						<p className="text-xs text-slate-500">
							Page {(pageable?.pageNumber ?? page) + 1} of{" "}
							{Math.max(totalPages, 1)}
						</p>
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="secondary"
								disabled={page === 0 || isFetching}
								onClick={() => setPage((p) => Math.max(0, p - 1))}
							>
								Previous
							</Button>
							<Button
								size="sm"
								variant="secondary"
								disabled={
									page >= Math.max(totalPages - 1, 0) || isFetching
								}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</div>
					</CardBody>
				) : null}
			</Card>

			<BulkUpdateStageModal
				open={bulkOpen}
				count={selected.size}
				submitting={isBulkUpdating}
				onClose={() => setBulkOpen(false)}
				onSubmit={handleBulkSubmit}
			/>
		</div>
	);
}

function BulkUpdateStageModal({ open, count, submitting, onClose, onSubmit }) {
	const [targetStage, setTargetStage] = useState("");
	const [reason, setReason] = useState("");

	useEffect(() => {
		if (!open) {
			setTargetStage("");
			setReason("");
		}
	}, [open]);

	function handleSubmit(event) {
		event.preventDefault();
		if (!targetStage) return;
		onSubmit?.({ targetStage, reason });
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={`Update ${count} application${count === 1 ? "" : "s"}`}
			size="sm"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !targetStage}
					>
						{submitting ? "Updating…" : "Update stage"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3">
				<p className="text-sm text-slate-600">
					Every selected application will be moved to the chosen stage.
					Per-application errors (other company, invalid transition)
					are reported as failures but don't stop the batch.
				</p>
				<Select
					label="Target stage"
					value={targetStage}
					onChange={(e) => setTargetStage(e.target.value)}
					options={[
						{ value: "", label: "Select a stage…" },
						...STAGE_TARGET_OPTIONS,
					]}
				/>
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Reason (optional)
					</span>
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={3}
						maxLength={500}
						placeholder="Captured on each application's stage history."
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
					/>
					<p className="mt-1 text-right text-xs text-slate-400">
						{reason.length}/500
					</p>
				</label>
			</form>
		</Modal>
	);
}

function Th({ children, className }) {
	return (
		<th
			className={`px-4 py-3 text-left font-semibold ${className ?? ""}`}
		>
			{children}
		</th>
	);
}

function Td({ children }) {
	return <td className="px-4 py-3 align-top">{children}</td>;
}

export default JobApplicationsPage;
