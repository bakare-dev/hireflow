import { useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import ConfirmModal from "../../components/common/ConfirmModal";
import EmptyState from "../../components/common/EmptyState";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import PageHeader from "../../components/common/PageHeader";
import {
	useCreateScorecardTemplateMutation,
	useDeleteScorecardTemplateMutation,
	useListScorecardTemplatesQuery,
} from "../../api/scorecardsApi";
import useToast from "../../hooks/useToast";

function ScorecardTemplatesPage() {
	const toast = useToast();
	const {
		data: response,
		isLoading,
		isError,
		error,
	} = useListScorecardTemplatesQuery();
	const [createTemplate, { isLoading: isCreating }] =
		useCreateScorecardTemplateMutation();
	const [deleteTemplate, { isLoading: isDeleting }] =
		useDeleteScorecardTemplateMutation();

	const templates = useMemo(() => {
		const list = Array.isArray(response) ? response : (response?.content ?? []);
		return list;
	}, [response]);

	const [createOpen, setCreateOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState(null);

	async function handleCreate(payload) {
		try {
			await createTemplate(payload).unwrap();
			toast.success("Template created.");
			setCreateOpen(false);
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to create template.",
			);
		}
	}

	async function handleConfirmDelete() {
		if (!pendingDelete) return;
		try {
			await deleteTemplate(pendingDelete.id).unwrap();
			toast.success("Template deactivated.");
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to deactivate template.",
			);
		} finally {
			setPendingDelete(null);
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Administration"
				title="Scorecard Templates"
				description="Rubrics HR uses to evaluate interview rounds. Every template has exactly 5 criteria, scored 1–5."
				actions={
					<Button size="sm" onClick={() => setCreateOpen(true)}>
						New template
					</Button>
				}
			/>

			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">
						All templates
					</h2>
				</CardHeader>
				<CardBody>
					{isLoading ? (
						<EmptyState
							title="Loading templates"
							description="Fetching your company's rubrics…"
						/>
					) : isError ? (
						<EmptyState
							title="Unable to load templates"
							description={
								error?.data?.message ??
								error?.error ??
								"Please try again."
							}
						/>
					) : templates.length ? (
						<ul className="space-y-4">
							{templates.map((t) => (
								<li
									key={t.id}
									className="rounded-md border border-slate-200 p-4"
								>
									<div className="flex flex-wrap items-start justify-between gap-2">
										<div>
											<div className="flex items-center gap-2">
												<h3 className="text-sm font-semibold text-slate-900">
													{t.name}
												</h3>
												<Badge
													className={
														t.isActive === false
															? "bg-slate-100 text-slate-500 ring-slate-200"
															: "bg-emerald-100 text-emerald-700 ring-emerald-200"
													}
												>
													{t.isActive === false
														? "Inactive"
														: "Active"}
												</Badge>
											</div>
											{t.description ? (
												<p className="mt-1 text-sm text-slate-600">
													{t.description}
												</p>
											) : null}
										</div>
										{t.isActive !== false ? (
											<Button
												size="sm"
												variant="danger"
												disabled={isDeleting}
												onClick={() => setPendingDelete(t)}
											>
												Deactivate
											</Button>
										) : null}
									</div>
									{t.criteria?.length ? (
										<ol className="mt-3 space-y-1.5">
											{[...t.criteria]
												.sort(
													(a, b) =>
														(a.displayOrder ?? 0) -
														(b.displayOrder ?? 0),
												)
												.map((c) => (
													<li
														key={c.id}
														className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm"
													>
														<div>
															<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
																{c.category}
															</span>
															<span className="ml-2 text-slate-900">
																{c.name}
															</span>
															{c.description ? (
																<span className="ml-2 text-xs text-slate-500">
																	— {c.description}
																</span>
															) : null}
														</div>
														<span className="text-xs font-medium text-slate-600">
															Max {c.maxScore}
														</span>
													</li>
												))}
										</ol>
									) : (
										<p className="mt-3 text-xs text-slate-500">
											No criteria on this template.
										</p>
									)}
								</li>
							))}
						</ul>
					) : (
						<EmptyState
							title="No templates yet"
							description="Create your first rubric so HR can submit scorecards."
						/>
					)}
				</CardBody>
			</Card>

			{createOpen ? (
				<CreateTemplateModal
					submitting={isCreating}
					onClose={() => setCreateOpen(false)}
					onSubmit={handleCreate}
				/>
			) : null}

			<ConfirmModal
				open={Boolean(pendingDelete)}
				onClose={() => setPendingDelete(null)}
				onConfirm={handleConfirmDelete}
				title="Deactivate template?"
				description={
					pendingDelete
						? `"${pendingDelete.name}" will be hidden from the scorecard picker. Existing scorecards keep their reference.`
						: ""
				}
				confirmButtonText="Deactivate"
				type="destructive"
			/>
		</div>
	);
}

const CRITERIA_COUNT = 5;
const MAX_SCORE_CEILING = 5;

function CreateTemplateModal({ submitting, onClose, onSubmit }) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	// The backend enforces exactly 5 criteria with maxScore 1–5 per criterion.
	const [criteria, setCriteria] = useState(() =>
		Array.from({ length: CRITERIA_COUNT }, () => blankCriterion()),
	);

	function setCriterion(index, key, value) {
		setCriteria((current) =>
			current.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
		);
	}

	function handleSubmit(event) {
		event.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) return;
		if (criteria.length !== CRITERIA_COUNT) return;
		const cleanedCriteria = criteria.map((c, idx) => {
			const maxScore = clampMaxScore(c.maxScore);
			return {
				category: c.category.trim(),
				name: c.name.trim(),
				description: c.description.trim() || undefined,
				maxScore,
				displayOrder: idx,
			};
		});
		if (
			cleanedCriteria.some(
				(c) => !c.category || !c.name || !c.maxScore,
			)
		) {
			return;
		}
		onSubmit?.({
			name: trimmedName,
			description: description.trim() || undefined,
			criteria: cleanedCriteria,
		});
	}

	const canSubmit =
		name.trim() &&
		criteria.length === CRITERIA_COUNT &&
		criteria.every(
			(c) =>
				c.category.trim() &&
				c.name.trim() &&
				clampMaxScore(c.maxScore) > 0,
		);

	return (
		<Modal
			open
			onClose={onClose}
			title="Create scorecard template"
			size="lg"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={submitting || !canSubmit}
					>
						{submitting ? "Saving…" : "Create template"}
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Template name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					placeholder="Engineer Default"
				/>
				<label className="block">
					<span className="mb-1 block text-sm font-medium text-slate-800">
						Description (optional)
					</span>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
						placeholder="Standard engineering interview rubric"
					/>
				</label>

				<div className="space-y-2">
					<div>
						<p className="text-sm font-medium text-slate-900">
							Criteria
						</p>
						<p className="text-xs text-slate-500">
							Every template has exactly 5 criteria, each scored
							1–5. The count and ceiling are enforced server-side.
						</p>
					</div>
					<ol className="space-y-2">
						{criteria.map((c, idx) => (
							<li
								key={idx}
								className="rounded-md border border-slate-200 p-3"
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
										#{idx + 1} of {CRITERIA_COUNT}
									</span>
								</div>
								<div className="mt-2 grid gap-2 sm:grid-cols-2">
									<Input
										label="Category"
										value={c.category}
										onChange={(e) =>
											setCriterion(
												idx,
												"category",
												e.target.value,
											)
										}
										required
										placeholder="Technical"
									/>
									<Input
										label="Name"
										value={c.name}
										onChange={(e) =>
											setCriterion(idx, "name", e.target.value)
										}
										required
										placeholder="System Design"
									/>
								</div>
								<label className="mt-2 block">
									<span className="mb-1 block text-sm font-medium text-slate-800">
										Description (optional)
									</span>
									<input
										type="text"
										value={c.description}
										onChange={(e) =>
											setCriterion(
												idx,
												"description",
												e.target.value,
											)
										}
										className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
										placeholder="Can design a service"
									/>
								</label>
								<label className="mt-2 block">
									<span className="mb-1 block text-sm font-medium text-slate-800">
										Max score (1–{MAX_SCORE_CEILING})
									</span>
									<input
										type="number"
										min={1}
										max={MAX_SCORE_CEILING}
										value={c.maxScore}
										onChange={(e) =>
											setCriterion(
												idx,
												"maxScore",
												e.target.value,
											)
										}
										required
										className="h-9 w-32 rounded-md border border-slate-200 px-3 text-sm"
									/>
								</label>
							</li>
						))}
					</ol>
				</div>
			</form>
		</Modal>
	);
}

function blankCriterion() {
	return { category: "", name: "", description: "", maxScore: 5 };
}

function clampMaxScore(value) {
	const n = Number(value);
	if (!Number.isFinite(n)) return 0;
	if (n < 1) return 0;
	return Math.min(Math.floor(n), MAX_SCORE_CEILING);
}

export default ScorecardTemplatesPage;
