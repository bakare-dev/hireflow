import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import { ROLE_LABELS, USER_ROLES } from "../../constants/roles";
import {
	useDeleteStaffMutation,
	useInviteManagerMutation,
	useListStaffQuery,
} from "../../api/adminApi";
import useToast from "../../hooks/useToast";
import { selectAuthUser } from "../../store/slices/authSlice";
import { normalizeApiRole } from "../../utils/api";
import { formatDate } from "../../utils/date";

const PAGE_SIZE = 10;

function TeamManagementPage() {
	const toast = useToast();
	const authUser = useSelector(selectAuthUser);
	const [page, setPage] = useState(0);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState(null);

	const {
		data: response,
		isLoading,
		isFetching,
		isError,
		error,
	} = useListStaffQuery({ page, size: PAGE_SIZE });
	const [inviteManager, { isLoading: isInviting }] =
		useInviteManagerMutation();
	const [deleteStaff, { isLoading: isDeleting }] = useDeleteStaffMutation();

	const staff = useMemo(() => response?.content ?? [], [response]);
	const pageable = response?.pageable;
	const totalPages = Math.max(pageable?.totalPages ?? 1, 1);
	const totalElements = pageable?.totalElements ?? staff.length;

	async function handleInvite(email) {
		try {
			await inviteManager({
				email,
				companyId: authUser?.companyId,
			}).unwrap();
			toast.success(`Invitation sent to ${email}.`);
			setInviteOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ?? err.error ?? "Unable to send invitation.",
			);
		}
	}

	async function handleConfirmDelete() {
		if (!pendingDelete) return;
		try {
			await deleteStaff(pendingDelete.id).unwrap();
			toast.success("Staff member removed.");
		} catch (err) {
			toast.error(
				err.data?.message ?? err.error ?? "Unable to remove staff.",
			);
		} finally {
			setPendingDelete(null);
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Administration"
				title="Team Management"
				description={`Active Admins and HR Managers attached to your company${
					totalElements ? ` (${totalElements} total)` : ""
				}.`}
				actions={
					<Button size="sm" onClick={() => setInviteOpen(true)}>
						Invite HR manager
					</Button>
				}
			/>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						Active staff
					</h2>
				</CardHeader>
				<div className="overflow-x-auto">
					{isLoading ? (
						<EmptyState
							title="Loading staff"
							description="Fetching active Admins and HR Managers…"
						/>
					) : isError ? (
						<EmptyState
							title="Unable to load staff"
							description={
								error?.data?.message ??
								error?.error ??
								"Please try again or refresh the page."
							}
						/>
					) : staff.length ? (
						<table className="min-w-full text-sm">
							<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
								<tr>
									<Th>Name</Th>
									<Th>Email</Th>
									<Th>Role</Th>
									<Th>Joined</Th>
									<Th>Actions</Th>
								</tr>
							</thead>
							<tbody>
								{staff.map((member) => {
									const normalizedRole = normalizeApiRole(
										member.role,
									);
									const isSelf = member.id === authUser?.id;
									return (
										<tr
											key={member.id}
											className="border-t border-slate-100 text-slate-700"
										>
											<Td>
												<p className="font-medium text-slate-900">
													{[
														member.firstName,
														member.lastName,
													]
														.filter(Boolean)
														.join(" ") || "—"}
													{isSelf ? (
														<span className="ml-2 text-xs font-normal text-slate-500">
															(you)
														</span>
													) : null}
												</p>
											</Td>
											<Td>{member.email}</Td>
											<Td>
												<Badge
													className={
														normalizedRole ===
														USER_ROLES.ADMIN
															? "bg-amber-100 text-amber-800 ring-amber-200"
															: "bg-sky-100 text-sky-700 ring-sky-200"
													}
												>
													{ROLE_LABELS[
														normalizedRole
													] ?? member.role}
												</Badge>
											</Td>
											<Td>
												{member.createdAt
													? formatDate(
															member.createdAt,
														)
													: "—"}
											</Td>
											<Td>
												<Button
													size="sm"
													variant="danger"
													disabled={
														isSelf || isDeleting
													}
													title={
														isSelf
															? "You cannot remove yourself"
															: undefined
													}
													onClick={() =>
														setPendingDelete(member)
													}
												>
													Remove
												</Button>
											</Td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						<EmptyState
							title="No staff yet"
							description="Invite an HR manager to get started."
						/>
					)}
				</div>
				{staff.length ? (
					<CardBody className="flex items-center justify-between border-t border-slate-100">
						<p className="text-xs text-slate-500">
							Page {(pageable?.pageNumber ?? page) + 1} of{" "}
							{totalPages}
						</p>
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="secondary"
								disabled={page === 0 || isFetching}
								onClick={() =>
									setPage((p) => Math.max(0, p - 1))
								}
							>
								Previous
							</Button>
							<Button
								size="sm"
								variant="secondary"
								disabled={page >= totalPages - 1 || isFetching}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</div>
					</CardBody>
				) : null}
			</Card>

			<InviteModal
				open={inviteOpen}
				submitting={isInviting}
				onClose={() => setInviteOpen(false)}
				onSubmit={handleInvite}
			/>

			<ConfirmModal
				open={Boolean(pendingDelete)}
				onClose={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
				title="Remove staff member?"
				description={
					pendingDelete
						? `This will revoke access for ${
								pendingDelete.email
							}. They will no longer be able to sign in.`
						: ""
				}
				confirmButtonText="Remove"
				type="destructive"
			/>
		</div>
	);
}

function InviteModal({ open, submitting, onClose, onSubmit }) {
	const [email, setEmail] = useState("");

	function close() {
		setEmail("");
		onClose?.();
	}

	function handleSubmit(event) {
		event.preventDefault();
		const trimmed = email.trim();
		if (!trimmed) return;
		onSubmit?.(trimmed);
	}

	useEffect(() => {
		if (!open) setEmail("");
	}, [open]);

	return (
		<Modal
			open={open}
			onClose={close}
			title="Invite HR manager"
			size="sm"
			footer={
				<>
					<Button variant="secondary" onClick={close}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !email.trim()}
					>
						{submitting ? "Sending…" : "Send invitation"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-3">
				<p className="text-sm text-slate-600">
					We will email a one-time signup link. The invitee picks
					their own name and password; their account is created as an
					HR Manager attached to your company.
				</p>
				<Input
					label="Email"
					type="email"
					required
					autoFocus
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="name@company.com"
				/>
			</form>
		</Modal>
	);
}

function Th({ children }) {
	return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function Td({ children }) {
	return <td className="px-4 py-3 align-top">{children}</td>;
}

export default TeamManagementPage;
