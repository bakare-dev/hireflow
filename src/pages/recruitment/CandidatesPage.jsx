import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import ConfirmModal from "../../components/common/ConfirmModal";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import StageBadge from "../../components/domain/StageBadge";
import { PIPELINE_STAGES } from "../../constants/stages";
import { USER_ROLES } from "../../constants/roles";
import { SEED_USERS } from "../../data";
import { selectAuthRole, selectAuthUser } from "../../store/slices/authSlice";
import { selectApplications } from "../../store/slices/applicationsSlice";
import { createInterviewSlot } from "../../store/slices/interviewsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { formatDate, formatDateTime } from "../../utils/date";
import useToast from "../../hooks/useToast";
import {
	aiByApplicationId,
	getUserMap,
	roleScopedApplications,
	roleScopedJobs,
	stageEta,
	stageUpdatesByApplicationId,
} from "../../utils/recruitmentUtils";

const STAGE_OPTIONS = [
	PIPELINE_STAGES.APPLIED,
	PIPELINE_STAGES.SCREENING,
	PIPELINE_STAGES.INTERVIEW_SCHEDULED,
	PIPELINE_STAGES.OFFER_SENT,
	PIPELINE_STAGES.HIRED,
	PIPELINE_STAGES.REJECTED,
];

function CandidatesPage() {
	const dispatch = useDispatch();
	const toast = useToast();
	const role = useSelector(selectAuthRole);
	const user = useSelector(selectAuthUser);
	const jobs = useSelector(selectJobs);
	const applications = useSelector(selectApplications);
	const [query, setQuery] = useState("");
	const [stageFilter, setStageFilter] = useState("ALL");
	const [selectedIds, setSelectedIds] = useState([]);
	const [activeId, setActiveId] = useState(null);
	const [moveModalOpen, setMoveModalOpen] = useState(false);
	const [scheduleOpen, setScheduleOpen] = useState(false);
	const [requestFeedbackOpen, setRequestFeedbackOpen] = useState(false);
	const [sendMailOpen, setSendMailOpen] = useState(false);
	const users = getUserMap();
	const aiMap = aiByApplicationId();
	const updatesMap = stageUpdatesByApplicationId();
	const scopedJobs = roleScopedJobs(jobs, role, user);
	const scopedApps = roleScopedApplications(
		applications,
		scopedJobs,
		role,
		user,
	);
	const jobsById = useMemo(
		() => new Map(scopedJobs.map((job) => [job.id, job])),
		[scopedJobs],
	);
	const staffOptions = SEED_USERS.filter(
		(item) =>
			item.companyId === user?.companyId &&
			[USER_ROLES.ADMIN, USER_ROLES.HIRING_MANAGER].includes(item.role),
	);

	const filtered = useMemo(() => {
		return scopedApps.filter((app) => {
			const job = jobsById.get(app.jobListingId);
			const person = users.get(app.applicantId);
			const q = `${person?.name ?? ""} ${job?.title ?? ""}`.toLowerCase();
			const queryPass = q.includes(query.toLowerCase());
			const stagePass =
				stageFilter === "ALL" || app.currentStage === stageFilter;
			return queryPass && stagePass;
		});
	}, [scopedApps, jobsById, users, query, stageFilter]);

	const activeApp = filtered.find((item) => item.id === activeId) ?? null;
	const selectedApps = filtered.filter((item) =>
		selectedIds.includes(item.id),
	);
	const allVisibleSelected =
		filtered.length > 0 &&
		filtered.every((item) => selectedIds.includes(item.id));

	function toggleSelection(id) {
		setSelectedIds((current) =>
			current.includes(id)
				? current.filter((item) => item !== id)
				: [...current, id],
		);
	}

	function selectVisible() {
		setSelectedIds(filtered.map((item) => item.id));
	}

	function clearSelection() {
		setSelectedIds([]);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Core ATS"
				title="Candidates"
				description="Filter-rich ATS table with side-panel review and bulk pipeline actions."
			/>

			<Card>
				<CardBody className="grid gap-4 md:grid-cols-4">
					<Input
						label="Search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Candidate or role"
					/>
					<label className="space-y-1">
						<span className="text-sm font-medium text-slate-800">
							Stage
						</span>
						<select
							value={stageFilter}
							onChange={(event) =>
								setStageFilter(event.target.value)
							}
							className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
						>
							<option value="ALL">All stages</option>
							{STAGE_OPTIONS.map((stage) => (
								<option key={stage} value={stage}>
									{stage}
								</option>
							))}
						</select>
					</label>
					<div className="space-y-1">
						<span className="text-sm font-medium text-slate-800">
							Saved views
						</span>
						<div className="flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm text-slate-600">
							Default Pipeline
						</div>
					</div>
					<div className="space-y-1">
						<span className="text-sm font-medium text-slate-800">
							Density
						</span>
						<div className="flex h-10 items-center rounded-md border border-slate-200 px-3 text-sm text-slate-600">
							Comfortable
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						Candidates Table
					</h2>
				</CardHeader>
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm">
						<thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
							<tr>
								<Th>
									<input
										type="checkbox"
										checked={allVisibleSelected}
										onChange={() =>
											allVisibleSelected
												? clearSelection()
												: selectVisible()
										}
									/>
								</Th>
								<Th>Candidate</Th>
								<Th>Match %</Th>
								<Th>Stage</Th>
								<Th>Experience</Th>
								<Th>Skills</Th>
								<Th>Recruiter</Th>
								<Th>Last Activity</Th>
								<Th>Applied Date</Th>
								<Th>Actions</Th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((app) => {
								const person = users.get(app.applicantId);
								const job = jobsById.get(app.jobListingId);
								const ai = aiMap.get(app.id);
								return (
									<tr
										key={app.id}
										className="border-t border-slate-100"
									>
										<Td>
											<input
												type="checkbox"
												checked={selectedIds.includes(
													app.id,
												)}
												onChange={() =>
													toggleSelection(app.id)
												}
											/>
										</Td>
										<Td>
											<p className="font-medium text-slate-900">
												{person?.name ??
													app.applicantId}
											</p>
											<p className="text-xs text-slate-500">
												{job?.title}
											</p>
										</Td>
										<Td>{ai?.matchPercentage ?? "-"}</Td>
										<Td>
											<StageBadge
												stage={app.currentStage}
											/>
										</Td>
										<Td>
											{person?.skills?.length ?? "-"} yrs
										</Td>
										<Td>
											<div className="flex flex-wrap gap-1">
												{(person?.skills ?? [])
													.slice(0, 3)
													.map((skill) => (
														<Badge
															key={skill}
															className="bg-slate-100 text-slate-700 ring-slate-200"
														>
															{skill}
														</Badge>
													))}
											</div>
										</Td>
										<Td>
											{users.get(job?.hiringManagerId)
												?.name ?? "Owner"}
										</Td>
										<Td>{stageEta(app.currentStage)}</Td>
										<Td>{formatDate(app.appliedAt)}</Td>
										<Td>
											<Button
												variant="secondary"
												size="sm"
												onClick={() =>
													setActiveId(app.id)
												}
											>
												Review
											</Button>
										</Td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Card>

			{selectedApps.length > 0 ? (
				<div className="sticky bottom-4 z-40 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-lg">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<p className="text-sm font-medium text-slate-900">
							{selectedApps.length} candidates selected
						</p>
						<div className="flex flex-wrap gap-2">
							<Button
								variant="secondary"
								size="sm"
								onClick={selectVisible}
							>
								Select filtered
							</Button>
							<Button
								size="sm"
								onClick={() => setMoveModalOpen(true)}
							>
								Move stage
							</Button>
							<Button variant="secondary" size="sm">
								Bulk rescan
							</Button>
							<Button variant="secondary" size="sm">
								Send bulk email
							</Button>
							<Button variant="secondary" size="sm">
								Add tags
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={clearSelection}
							>
								Clear
							</Button>
						</div>
					</div>
				</div>
			) : null}

			<CandidateSidePanel
				open={!!activeApp}
				application={activeApp}
				users={users}
				jobsById={jobsById}
				aiMap={aiMap}
				updatesMap={updatesMap}
				onScheduleInterview={() => setScheduleOpen(true)}
				onRequestFeedback={() => setRequestFeedbackOpen(true)}
				onSendMail={() => setSendMailOpen(true)}
				onClose={() => setActiveId(null)}
			/>

			<MoveStageModal
				open={moveModalOpen}
				onClose={() => setMoveModalOpen(false)}
				selectedApps={selectedApps}
				staffOptions={staffOptions}
			/>
			<ScheduleInterviewModal
				open={scheduleOpen}
				onClose={() => setScheduleOpen(false)}
				activeApp={activeApp}
				staffOptions={staffOptions}
				onSubmit={async ({ date, time, meetLink, interviewerId }) => {
					if (!activeApp) return;
					const scheduledAt = new Date(
						`${date}T${time}:00`,
					).toISOString();
					const action = await dispatch(
						createInterviewSlot({
							applicationId: activeApp.id,
							hiringManagerId: interviewerId || user?.id,
							scheduledAt,
							durationMinutes: 45,
							meetLink,
						}),
					);
					if (createInterviewSlot.fulfilled.match(action)) {
						toast.success("Interview scheduled successfully.");
					} else {
						toast.error(
							action.error?.message ??
								"Unable to schedule interview.",
						);
					}
				}}
			/>
			<ConfirmModal
				open={requestFeedbackOpen}
				onClose={() => setRequestFeedbackOpen(false)}
				title="Request feedback"
				description="Send a feedback request to assigned interviewers for this candidate?"
				confirmButtonText="Send Request"
				type="success"
				onConfirm={() => toast.success("Feedback request sent.")}
			/>
			<ConfirmModal
				open={sendMailOpen}
				onClose={() => setSendMailOpen(false)}
				title="Send email"
				description="Send a candidate communication email with next-step details?"
				confirmButtonText="Send Email"
				type="success"
				onConfirm={() => toast.success("Email queued for delivery.")}
			/>
		</div>
	);
}

function CandidateSidePanel({
	open,
	application,
	users,
	jobsById,
	aiMap,
	updatesMap,
	onScheduleInterview,
	onRequestFeedback,
	onSendMail,
	onClose,
}) {
	if (!open || !application) return null;
	const candidate = users.get(application.applicantId);
	const job = jobsById.get(application.jobListingId);
	const ai = aiMap.get(application.id);
	const updates = updatesMap.get(application.id) ?? [];
	return (
		<div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30">
			<div className="h-full w-full max-w-5xl overflow-y-auto bg-white p-5">
				<div className="mb-4 flex items-center justify-between">
					<h3 className="text-lg font-semibold text-slate-900">
						Candidate Review Panel
					</h3>
					<Button variant="ghost" onClick={onClose}>
						Close
					</Button>
				</div>
				<div className="grid gap-4 xl:grid-cols-3">
					<Card>
						<CardHeader>
							<h4 className="text-sm font-semibold text-slate-900">
								Profile & Resume
							</h4>
						</CardHeader>
						<CardBody className="space-y-2 text-sm text-slate-700">
							<p className="font-medium text-slate-900">
								{candidate?.name}
							</p>
							<p>{candidate?.email}</p>
							<p>Role: {job?.title}</p>
							<p>
								Resume: {candidate?.resumeUrl ?? "Unavailable"}
							</p>
							<div className="flex flex-wrap gap-1">
								{(candidate?.skills ?? []).map((skill) => (
									<Badge
										key={skill}
										className="bg-slate-100 text-slate-700 ring-slate-200"
									>
										{skill}
									</Badge>
								))}
							</div>
						</CardBody>
					</Card>
					<Card>
						<CardHeader>
							<h4 className="text-sm font-semibold text-slate-900">
								AI Analysis & Timeline
							</h4>
						</CardHeader>
						<CardBody className="space-y-2 text-sm text-slate-700">
							<p>Match: {ai?.matchPercentage ?? "-"}%</p>
							<p>
								Missing skills:{" "}
								{(ai?.unmatchedSkills ?? []).join(", ") ||
									"None"}
							</p>
							<p className="text-xs text-slate-500">
								{ai?.summaryNote ?? "No AI notes available"}
							</p>
							<div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
								{updates.map((update) => (
									<div key={update.id}>
										<p className="text-sm font-medium text-slate-900">
											{update.currentStage}
										</p>
										<p className="text-xs text-slate-500">
											{formatDateTime(update.occurredAt)}
										</p>
									</div>
								))}
							</div>
						</CardBody>
					</Card>
					<Card>
						<CardHeader>
							<h4 className="text-sm font-semibold text-slate-900">
								Notes & Quick Actions
							</h4>
						</CardHeader>
						<CardBody className="space-y-2">
							<textarea
								rows={5}
								placeholder="Internal comments"
								className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
							/>
							<div className="grid gap-2">
								<Button size="sm" onClick={onScheduleInterview}>
									Schedule interview
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={onRequestFeedback}
								>
									Request feedback
								</Button>
								<Button
									variant="secondary"
									size="sm"
									onClick={onSendMail}
								>
									Send email
								</Button>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
}

function MoveStageModal({ open, onClose, selectedApps, staffOptions }) {
	const [nextStage, setNextStage] = useState(PIPELINE_STAGES.SCREENING);
	const [staffId, setStaffId] = useState(staffOptions[0]?.id ?? "");
	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Move Stage"
			footer={
				<>
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={onClose}>Confirm move</Button>
				</>
			}
		>
			<div className="space-y-4 text-sm">
				<p className="text-slate-700">
					Affected candidates: <strong>{selectedApps.length}</strong>
				</p>
				<div>
					<label className="mb-1 block font-medium text-slate-800">
						Destination stage
					</label>
					<select
						value={nextStage}
						onChange={(event) => setNextStage(event.target.value)}
						className="h-10 w-full rounded-md border border-slate-200 px-3"
					>
						{STAGE_OPTIONS.map((stage) => (
							<option key={stage} value={stage}>
								{stage}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="mb-1 block font-medium text-slate-800">
						Interview assignment
					</label>
					<select
						value={staffId}
						onChange={(event) => setStaffId(event.target.value)}
						className="h-10 w-full rounded-md border border-slate-200 px-3"
					>
						{staffOptions.map((staff) => (
							<option key={staff.id} value={staff.id}>
								{staff.name} ({staff.role})
							</option>
						))}
					</select>
				</div>
				<Input label="Schedule date" type="date" />
				<textarea
					rows={3}
					placeholder="Transition note"
					className="w-full rounded-md border border-slate-200 px-3 py-2"
				/>
				<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
					Validation warnings may apply for missing feedback or
					inactive candidates.
				</div>
			</div>
		</Modal>
	);
}

function ScheduleInterviewModal({
	open,
	onClose,
	activeApp,
	staffOptions,
	onSubmit,
}) {
	const [meetLink, setMeetLink] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [note, setNote] = useState("");
	const [interviewerId, setInterviewerId] = useState(
		staffOptions[0]?.id ?? "",
	);

	async function submit() {
		if (!meetLink || !date || !time) return;
		await onSubmit({ meetLink, date, time, note, interviewerId });
		setMeetLink("");
		setDate("");
		setTime("");
		setNote("");
		onClose();
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Schedule Interview"
			footer={
				<>
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={submit}>Schedule</Button>
				</>
			}
		>
			<div className="space-y-3 text-sm">
				<p className="text-slate-600">
					Application: {activeApp?.id ?? "No candidate selected"}
				</p>
				<Input
					label="Meeting link"
					value={meetLink}
					onChange={(event) => setMeetLink(event.target.value)}
					placeholder="https://meet.google.com/..."
				/>
				<div className="grid gap-3 sm:grid-cols-2">
					<Input
						label="Date"
						type="date"
						value={date}
						onChange={(event) => setDate(event.target.value)}
					/>
					<Input
						label="Time"
						type="time"
						value={time}
						onChange={(event) => setTime(event.target.value)}
					/>
				</div>
				<div>
					<label className="mb-1 block font-medium text-slate-800">
						Interviewer
					</label>
					<select
						value={interviewerId}
						onChange={(event) =>
							setInterviewerId(event.target.value)
						}
						className="h-10 w-full rounded-md border border-slate-200 px-3"
					>
						{staffOptions.map((staff) => (
							<option key={staff.id} value={staff.id}>
								{staff.name} ({staff.role})
							</option>
						))}
					</select>
				</div>
				<label className="block">
					<span className="mb-1 block font-medium text-slate-800">
						Note
					</span>
					<textarea
						rows={3}
						value={note}
						onChange={(event) => setNote(event.target.value)}
						className="w-full rounded-md border border-slate-200 px-3 py-2"
					/>
				</label>
			</div>
		</Modal>
	);
}

function Th({ children }) {
	return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
}

function Td({ children }) {
	return <td className="px-4 py-3 align-top text-slate-700">{children}</td>;
}

export default CandidatesPage;
