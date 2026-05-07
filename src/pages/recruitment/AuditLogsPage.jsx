import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { SEED_STAGE_UPDATES, SEED_USERS } from "../../data";
import { selectAuthUser } from "../../store/slices/authSlice";
import { formatDateTime } from "../../utils/date";

function AuditLogsPage() {
	const authUser = useSelector(selectAuthUser);
	const [userFilter, setUserFilter] = useState("");
	const [moduleFilter, setModuleFilter] = useState("ALL");
	const userMap = useMemo(
		() => new Map(SEED_USERS.map((user) => [user.id, user])),
		[],
	);

	const logs = useMemo(() => {
		const stageLogs = SEED_STAGE_UPDATES.map((update) => ({
			id: update.id,
			userId: update.actorId,
			userName: userMap.get(update.actorId)?.name ?? update.actorId,
			actionType: "Stage Movement",
			module: "Candidates",
			candidate: update.applicationId,
			occurredAt: update.occurredAt,
			companyId: authUser?.companyId,
		}));
		const syntheticLogs = [
			{
				id: "audit_job_edit",
				userId: "user_hm",
				userName: "Harvey Hiring",
				actionType: "Job Edit",
				module: "Jobs",
				candidate: "-",
				occurredAt: "2026-05-05T10:00:00.000Z",
				companyId: authUser?.companyId,
			},
			{
				id: "audit_offer_action",
				userId: "user_hm",
				userName: "Harvey Hiring",
				actionType: "Offer Action",
				module: "Offers",
				candidate: "app_mei_backend",
				occurredAt: "2026-05-06T13:00:00.000Z",
				companyId: authUser?.companyId,
			},
		];
		return [...syntheticLogs, ...stageLogs];
	}, [authUser, userMap]);

	const filtered = logs.filter((log) => {
		const userPass = log.userName.toLowerCase().includes(userFilter.toLowerCase());
		const modulePass = moduleFilter === "ALL" || log.module === moduleFilter;
		return userPass && modulePass;
	});

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Administration"
				title="Audit Logs"
				description="Governance stream for stage movements, job edits, AI decisions, and user activity."
			/>

			<Card>
				<CardBody className="grid gap-4 md:grid-cols-2">
					<Input
						label="User filter"
						value={userFilter}
						onChange={(event) => setUserFilter(event.target.value)}
						placeholder="Filter by user"
					/>
					<label className="space-y-1">
						<span className="text-sm font-medium text-slate-800">Module</span>
						<select
							value={moduleFilter}
							onChange={(event) => setModuleFilter(event.target.value)}
							className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
						>
							<option value="ALL">All modules</option>
							<option value="Candidates">Candidates</option>
							<option value="Jobs">Jobs</option>
							<option value="Offers">Offers</option>
						</select>
					</label>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">Audit Events</h2>
				</CardHeader>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
							<tr>
								<Th>User</Th>
								<Th>Action Type</Th>
								<Th>Candidate</Th>
								<Th>Module</Th>
								<Th>Date</Th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((log) => (
								<tr key={log.id} className="border-t border-slate-100">
									<Td>{log.userName}</Td>
									<Td>{log.actionType}</Td>
									<Td>{log.candidate}</Td>
									<Td>{log.module}</Td>
									<Td>{formatDateTime(log.occurredAt)}</Td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}

function Th({ children }) {
	return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function Td({ children }) {
	return <td className="px-4 py-3 text-slate-700">{children}</td>;
}

export default AuditLogsPage;
