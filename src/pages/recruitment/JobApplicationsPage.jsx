import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import PageHeader from "../../components/common/PageHeader";
import { ROUTES } from "../../constants/routes";
import {
	STAGE_BADGE_COLORS,
	STAGE_LABELS,
} from "../../constants/stages";
import { useGetJobApplicationsQuery } from "../../api/applicationsApi";
import { useGetJobQuery } from "../../api/jobsApi";

const PAGE_SIZE = 10;

function JobApplicationsPage() {
	const { id } = useParams();
	const jobId = id ?? "";
	const [page, setPage] = useState(0);

	const { data: job } = useGetJobQuery(jobId, { skip: !jobId });
	const {
		data: response,
		isLoading,
		isFetching,
		isError,
		error,
	} = useGetJobApplicationsQuery(
		{ jobId, page, size: PAGE_SIZE },
		{ skip: !jobId },
	);

	const applications = useMemo(() => response?.content ?? [], [response]);
	const pageable = response?.pageable;
	const totalPages = pageable?.totalPages ?? 1;
	const totalElements = pageable?.totalElements ?? applications.length;

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
								error?.message ??
								"Please try again or refresh the page."
							}
						/>
					) : applications.length ? (
						<table className="min-w-full text-sm">
							<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
								<tr>
									<Th>Applicant</Th>
									<Th>Stage</Th>
									<Th>Submitted</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody>
								{applications.map((app) => (
									<tr
										key={app.id}
										className="border-t border-slate-100 text-slate-700"
									>
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
											{app.createdAt
												? new Date(app.createdAt).toLocaleDateString()
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
								))}
							</tbody>
						</table>
					) : (
						<EmptyState
							title="No applications yet"
							description="Candidates who apply to this listing will appear here."
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
		</div>
	);
}

function Th({ children }) {
	return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function Td({ children }) {
	return <td className="px-4 py-3 align-top">{children}</td>;
}

export default JobApplicationsPage;
