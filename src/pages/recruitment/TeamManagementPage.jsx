import { useMemo } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { USER_ROLES } from "../../constants/roles";
import { SEED_USERS } from "../../data";
import { selectAuthUser } from "../../store/slices/authSlice";
import { formatDate } from "../../utils/date";

function TeamManagementPage() {
	const authUser = useSelector(selectAuthUser);
	const rows = useMemo(
		() =>
			SEED_USERS.filter(
				(user) =>
					user.companyId === authUser?.companyId &&
					[USER_ROLES.ADMIN, USER_ROLES.HIRING_MANAGER].includes(user.role),
			),
		[authUser],
	);

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Administration"
				title="Team Management"
				description="Invite and manage Admin and Hiring Manager staff accounts."
				actions={<Button>Invite staff</Button>}
			/>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">Team Members</h2>
				</CardHeader>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
							<tr>
								<Th>Name</Th>
								<Th>Email</Th>
								<Th>Role</Th>
								<Th>Status</Th>
								<Th>Last active</Th>
								<Th>Actions</Th>
							</tr>
						</thead>
						<tbody>
							{rows.map((user) => (
								<tr key={user.id} className="border-t border-slate-100">
									<Td>{user.name}</Td>
									<Td>{user.email}</Td>
									<Td>{user.role}</Td>
									<Td>
										<Badge className="bg-emerald-100 text-emerald-700 ring-emerald-200">
											Active
										</Badge>
									</Td>
									<Td>{formatDate(user.createdAt)}</Td>
									<Td>
										<div className="flex flex-wrap gap-2">
											<Button variant="secondary" size="sm">
												Change role
											</Button>
											<Button variant="secondary" size="sm">
												Suspend
											</Button>
											<Button variant="ghost" size="sm">
												Remove
											</Button>
										</div>
									</Td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<CardBody className="border-t border-slate-100 text-xs text-slate-500">
					Role selector options: Admin, Hiring Manager.
				</CardBody>
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

export default TeamManagementPage;
