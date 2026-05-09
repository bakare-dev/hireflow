import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { EMPLOYMENT_TYPE_LABELS, WORK_MODE_LABELS } from "../../constants/employment";
import { ROUTES } from "../../constants/routes";
import { selectAuthUser } from "../../store/slices/authSlice";
import { createJob, selectJobById, updateJob } from "../../store/slices/jobsSlice";
import useToast from "../../hooks/useToast";

function JobListingFormPage() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const user = useSelector(selectAuthUser);
	const existingJob = useSelector(selectJobById(id ?? ""));
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState(() => initForm(existingJob));

	const title = useMemo(
		() => (isEdit ? "Update Job Listing" : "Create Job Listing"),
		[isEdit],
	);

	function setField(field, value) {
		setForm((current) => ({ ...current, [field]: value }));
	}

	if (isEdit && !existingJob) {
		return (
			<div className="space-y-4">
				<PageHeader title="Update Job Listing" description="Loading listing details..." />
			</div>
		);
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!user) return;
		setSaving(true);
		const payload = {
			title: form.title.trim(),
			location: form.location.trim(),
			workMode: form.workMode,
			employmentType: form.employmentType,
			description: form.description.trim(),
			requiredSkills: parseCsv(form.requiredSkills),
			niceToHaveSkills: parseCsv(form.niceToHaveSkills),
			salary: {
				min: Number(form.salaryMin) || 0,
				max: Number(form.salaryMax) || 0,
				currency: form.salaryCurrency.trim() || "USD",
			},
			companyId: user.companyId,
			hiringManagerId: user.id,
			status: form.status,
		};

		if (isEdit && id) {
			const action = await dispatch(updateJob({ id, patch: payload }));
			setSaving(false);
			if (updateJob.fulfilled.match(action)) {
				toast.success("Job listing updated.");
				navigate(ROUTES.JOB_LISTINGS);
			} else {
				toast.error(action.error?.message ?? "Unable to update listing.");
			}
			return;
		}

		const action = await dispatch(createJob(payload));
		setSaving(false);
		if (createJob.fulfilled.match(action)) {
			toast.success("Job listing created.");
			navigate(ROUTES.JOB_LISTINGS);
		} else {
			toast.error(action.error?.message ?? "Unable to create listing.");
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Jobs"
				title={title}
				description="Create or update listing details, workflow readiness, and compensation ranges."
			/>
			<form onSubmit={handleSubmit} className="space-y-5">
				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Basic Info</h2>
					</CardHeader>
					<CardBody className="grid gap-4 md:grid-cols-2">
						<Input label="Title" value={form.title} onChange={(e) => setField("title", e.target.value)} required />
						<Input label="Location" value={form.location} onChange={(e) => setField("location", e.target.value)} required />
						<SelectField
							label="Work mode"
							value={form.workMode}
							options={Object.entries(WORK_MODE_LABELS)}
							onChange={(value) => setField("workMode", value)}
						/>
						<SelectField
							label="Employment type"
							value={form.employmentType}
							options={Object.entries(EMPLOYMENT_TYPE_LABELS)}
							onChange={(value) => setField("employmentType", value)}
						/>
						<div className="md:col-span-2">
							<label className="block">
								<span className="mb-1 block text-sm font-medium text-slate-800">Description</span>
								<textarea
									rows={5}
									value={form.description}
									onChange={(e) => setField("description", e.target.value)}
									className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
									required
								/>
							</label>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Requirements</h2>
					</CardHeader>
					<CardBody className="grid gap-4">
						<Input
							label="Required skills (comma separated)"
							value={form.requiredSkills}
							onChange={(e) => setField("requiredSkills", e.target.value)}
						/>
						<Input
							label="Nice-to-have skills (comma separated)"
							value={form.niceToHaveSkills}
							onChange={(e) => setField("niceToHaveSkills", e.target.value)}
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Compensation</h2>
					</CardHeader>
					<CardBody className="grid gap-4 md:grid-cols-3">
						<Input label="Min salary" value={form.salaryMin} onChange={(e) => setField("salaryMin", e.target.value)} />
						<Input label="Max salary" value={form.salaryMax} onChange={(e) => setField("salaryMax", e.target.value)} />
						<Input label="Currency" value={form.salaryCurrency} onChange={(e) => setField("salaryCurrency", e.target.value)} />
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">Publishing</h2>
					</CardHeader>
					<CardBody>
						<SelectField
							label="Listing status"
							value={form.status}
							options={[
								["DRAFT", "Draft"],
								["OPEN", "Open"],
								["PAUSED", "Paused"],
								["CLOSED", "Closed"],
							]}
							onChange={(value) => setField("status", value)}
						/>
					</CardBody>
				</Card>

				<div className="flex items-center gap-2">
					<Button type="submit" disabled={saving}>
						{saving ? "Saving..." : isEdit ? "Update listing" : "Create listing"}
					</Button>
					<Link to={ROUTES.JOB_LISTINGS}>
						<Button type="button" variant="secondary">Cancel</Button>
					</Link>
				</div>
			</form>
		</div>
	);
}

function SelectField({ label, value, onChange, options }) {
	return (
		<label className="block">
			<span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
			>
				{options.map(([optionValue, optionLabel]) => (
					<option key={optionValue} value={optionValue}>
						{optionLabel}
					</option>
				))}
			</select>
		</label>
	);
}

function parseCsv(value) {
	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

function defaultForm() {
	return {
		title: "",
		location: "",
		workMode: "REMOTE",
		employmentType: "FULL_TIME",
		description: "",
		requiredSkills: "",
		niceToHaveSkills: "",
		salaryMin: "",
		salaryMax: "",
		salaryCurrency: "USD",
		status: "DRAFT",
	};
}

function initForm(job) {
	if (!job) return defaultForm();
	return {
		title: job.title ?? "",
		location: job.location ?? "",
		workMode: job.workMode ?? "REMOTE",
		employmentType: job.employmentType ?? "FULL_TIME",
		description: job.description ?? "",
		requiredSkills: (job.requiredSkills ?? []).join(", "),
		niceToHaveSkills: (job.niceToHaveSkills ?? []).join(", "),
		salaryMin: String(job.salary?.min ?? ""),
		salaryMax: String(job.salary?.max ?? ""),
		salaryCurrency: job.salary?.currency ?? "USD",
		status: job.status ?? "DRAFT",
	};
}

export default JobListingFormPage;
