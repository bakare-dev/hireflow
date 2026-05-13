import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
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
	const navigate = useNavigate();
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
						placeholder="Title"
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
												{JOB_STATUS_LABELS[
													job.status
												] ?? job.status}
											</Badge>
										</Td>
										<Td>
											<ActionsMenu
												items={[
													{
														label: "View",
														onSelect: () =>
															navigate(
																ROUTES.JOB_DETAIL(
																	job.id,
																),
															),
													},
													{
														label: "View applications",
														onSelect: () =>
															navigate(
																ROUTES.JOB_APPLICATIONS(
																	job.id,
																),
															),
													},
													{
														label: "Edit",
														onSelect: () =>
															navigate(
																ROUTES.JOB_LISTING_EDIT(
																	job.id,
																),
															),
													},
													{
														label: "Delete",
														variant: "danger",
														disabled: isDeleting,
														onSelect: () =>
															setPendingDelete(
																job,
															),
													},
												]}
											/>
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

function ActionsMenu({ items }) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef(null);
	const menuRef = useRef(null);
	const [position, setPosition] = useState(null);

	useLayoutEffect(() => {
		if (!open || !triggerRef.current) return;
		const rect = triggerRef.current.getBoundingClientRect();
		setPosition({
			top: rect.bottom + 4,
			left: rect.right - 176,
		});
	}, [open]);

	useEffect(() => {
		if (!open) return undefined;
		function handlePointerDown(event) {
			const inTrigger = triggerRef.current?.contains(event.target);
			const inMenu = menuRef.current?.contains(event.target);
			if (!inTrigger && !inMenu) setOpen(false);
		}
		function handleKey(event) {
			if (event.key === "Escape") setOpen(false);
		}
		function handleViewportChange() {
			setOpen(false);
		}
		window.addEventListener("mousedown", handlePointerDown);
		window.addEventListener("keydown", handleKey);
		window.addEventListener("scroll", handleViewportChange, true);
		window.addEventListener("resize", handleViewportChange);
		return () => {
			window.removeEventListener("mousedown", handlePointerDown);
			window.removeEventListener("keydown", handleKey);
			window.removeEventListener("scroll", handleViewportChange, true);
			window.removeEventListener("resize", handleViewportChange);
		};
	}, [open]);

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((o) => !o)}
				className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
			>
				<span className="sr-only">Open actions menu</span>
				<svg
					aria-hidden
					viewBox="0 0 20 20"
					fill="currentColor"
					className="h-4 w-4"
				>
					<circle cx="10" cy="4" r="1.6" />
					<circle cx="10" cy="10" r="1.6" />
					<circle cx="10" cy="16" r="1.6" />
				</svg>
			</button>
			{open && position
				? createPortal(
						<div
							ref={menuRef}
							role="menu"
							style={{
								position: "fixed",
								top: position.top,
								left: position.left,
							}}
							className="z-50 w-44 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
						>
							{items.map((item) => (
								<button
									key={item.label}
									type="button"
									role="menuitem"
									disabled={item.disabled}
									onClick={() => {
										setOpen(false);
										item.onSelect?.();
									}}
									className={`block w-full px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
										item.variant === "danger"
											? "text-rose-600 hover:bg-rose-50"
											: "text-slate-700 hover:bg-slate-50"
									}`}
								>
									{item.label}
								</button>
							))}
						</div>,
						document.body,
					)
				: null}
		</>
	);
}

export default JobListingsPage;
