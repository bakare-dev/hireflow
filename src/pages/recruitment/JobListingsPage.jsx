import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { JOB_STATUS_LABELS } from "../../constants/jobStatus";
import { ROUTES } from "../../constants/routes";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDate } from "../../utils/date";
import {
	avgAiMatchForJob,
	getUserMap,
	roleScopedApplications,
	roleScopedJobs,
} from "./recruitmentUtils";

function JobListingsPage() {
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const [query, setQuery] = useState("");
	const [view, setView] = useState("table");

	const users = getUserMap();
	const scopedJobs = useMemo(
		() => roleScopedJobs(jobs, role, user),
		[jobs, role, user],
	);
	const scopedApps = useMemo(
		() => roleScopedApplications(applications, scopedJobs, role, user),
		[applications, scopedJobs, role, user],
	);
	const filtered = scopedJobs.filter((job) =>
		`${job.title} ${job.location}`.toLowerCase().includes(query.toLowerCase()),
	);

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Core Recruitment"
				title="Job Listings"
				description="Operational workspace for all active and historical listings."
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant={view === "table" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setView("table")}
						>
							Table
						</Button>
						<Button
							variant={view === "compact" ? "primary" : "secondary"}
							size="sm"
							onClick={() => setView("compact")}
						>
							Compact
						</Button>
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
				</CardBody>
			</Card>

			{view === "table" ? (
				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">All Listings</h2>
					</CardHeader>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
								<tr>
									<Th>Job title</Th>
									<Th>Hiring manager</Th>
									<Th>Applicants</Th>
									<Th>Avg AI match</Th>
									<Th>Status</Th>
									<Th>Created</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody>
								{filtered.map((job) => {
									const applicantCount = scopedApps.filter(
										(app) => app.jobListingId === job.id,
									).length;
									const ai = avgAiMatchForJob(job.id, scopedApps);
									return (
										<tr
											key={job.id}
											className="border-t border-slate-100 text-slate-700"
										>
											<Td>
												<p className="font-medium text-slate-900">{job.title}</p>
												<p className="text-xs text-slate-500">{job.location}</p>
											</Td>
											<Td>{users.get(job.hiringManagerId)?.name ?? "Unassigned"}</Td>
											<Td>{applicantCount}</Td>
											<Td>{ai || "-"}</Td>
											<Td>
												<Badge className="bg-slate-100 text-slate-700 ring-slate-200">
													{JOB_STATUS_LABELS[job.status]}
												</Badge>
											</Td>
											<Td>{formatDate(job.createdAt)}</Td>
											<Td>
												<Link to={ROUTES.JOB_DETAIL(job.id)}>
													<Button variant="secondary" size="sm">
														View analytics
													</Button>
												</Link>
											</Td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</Card>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{filtered.map((job) => {
						const applicantCount = scopedApps.filter(
							(app) => app.jobListingId === job.id,
						).length;
						const ai = avgAiMatchForJob(job.id, scopedApps);
						return (
							<Card key={job.id}>
								<CardBody className="space-y-3">
									<p className="text-lg font-semibold text-slate-900">{job.title}</p>
									<p className="text-sm text-slate-600">{job.location}</p>
									<div className="flex items-center justify-between text-sm">
										<span>Applicants: {applicantCount}</span>
										<span>AI: {ai || "-"}%</span>
									</div>
									<Badge className="bg-slate-100 text-slate-700 ring-slate-200">
										{JOB_STATUS_LABELS[job.status]}
									</Badge>
									<Link to={ROUTES.JOB_DETAIL(job.id)}>
										<Button variant="secondary" size="sm">
											Open job dashboard
										</Button>
									</Link>
								</CardBody>
							</Card>
						);
					})}
				</div>
			)}
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
