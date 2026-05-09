import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import SkillSelector from "../../components/common/SkillSelector";
import { ROUTES } from "../../constants/routes";
import { selectAuthUser } from "../../store/slices/authSlice";
import {
	useCreateJobMutation,
	useUpdateJobMutation,
	useGetJobQuery,
} from "../../api/jobsApi";
import useToast from "../../hooks/useToast";
import RichTextEditor from "../../components/editor/RichTextEditor";

const JOB_TYPES = [
	["FULL_TIME", "Full Time"],
	["PART_TIME", "Part Time"],
	["CONTRACT", "Contract"],
	["INTERNSHIP", "Internship"],
	["REMOTE", "Remote"],
];

const JOB_STATUSES = [
	["DRAFT", "Draft"],
	["OPEN", "Open"],
	["PAUSED", "Paused"],
	["CLOSED", "Closed"],
	["FILLED", "Filled"],
];

function JobListingFormPage() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const navigate = useNavigate();
	const toast = useToast();
	const user = useSelector(selectAuthUser);

	const { data: existingJob, isLoading: isLoadingJob } = useGetJobQuery(
		id ?? "",
		{
			skip: !isEdit,
		},
	);
	const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
	const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

	const [form, setForm] = useState(() => initForm(existingJob));

	const title = useMemo(
		() => (isEdit ? "Update Job Listing" : "Create Job Listing"),
		[isEdit],
	);

	function setField(field, value) {
		setForm((current) => ({ ...current, [field]: value }));
	}

	if (isEdit && isLoadingJob) {
		return (
			<div className="space-y-4">
				<PageHeader
					title="Update Job Listing"
					description="Loading listing details..."
				/>
			</div>
		);
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!user) {
			toast.error("User not authenticated");
			return;
		}

		const payload = {
			title: form.title.trim(),
			type: form.type,
			location: form.location.trim(),
			summary: form.summary,
			responsibilities: form.responsibilities,
			requiredQualifications: form.requiredQualifications,
			preferredQualifications: form.preferredQualifications,
			status: form.status,
			autoRejectThreshold: Number(form.autoRejectThreshold),
			autoPassThreshold: Number(form.autoPassThreshold),
			skillIds: form.skills.map((s) => s.id),
		};

		try {
			if (isEdit && id) {
				await updateJob({ id, patch: payload }).unwrap();
				toast.success("Job listing updated.");
				navigate(ROUTES.JOB_LISTINGS);
			} else {
				await createJob(payload).unwrap();
				toast.success("Job listing created.");
				navigate(ROUTES.JOB_LISTINGS);
			}
		} catch (err) {
			toast.error(err?.message ?? "Unable to save job listing");
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Jobs"
				title={title}
				description="Create or update listing details with job description, qualifications, and screening thresholds."
			/>
			<form onSubmit={handleSubmit} className="space-y-5">
				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Basic Info
						</h2>
					</CardHeader>
					<CardBody className="grid gap-4 md:grid-cols-2">
						<Input
							label="Title"
							value={form.title}
							onChange={(e) => setField("title", e.target.value)}
							required
						/>
						<SelectField
							label="Job Type"
							value={form.type}
							options={JOB_TYPES}
							onChange={(value) => setField("type", value)}
							required
						/>
						<Input
							label="Location"
							value={form.location}
							onChange={(e) =>
								setField("location", e.target.value)
							}
							required
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Job Description
						</h2>
					</CardHeader>
					<CardBody className="space-y-4">
						<div>
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-800">
									Summary
								</span>
								<RichTextEditor
									value={form.summary}
									onChange={(value) =>
										setField("summary", value)
									}
									placeholder="Brief overview of the position..."
								/>
							</label>
						</div>
						<div>
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-800">
									Responsibilities
								</span>
								<RichTextEditor
									value={form.responsibilities}
									onChange={(value) =>
										setField("responsibilities", value)
									}
									placeholder="Key responsibilities and day-to-day tasks..."
								/>
							</label>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Qualifications
						</h2>
					</CardHeader>
					<CardBody className="space-y-4">
						<div>
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-800">
									Required Qualifications
								</span>
								<RichTextEditor
									value={form.requiredQualifications}
									onChange={(value) =>
										setField(
											"requiredQualifications",
											value,
										)
									}
									placeholder="Required skills, experience, and education..."
								/>
							</label>
						</div>
						<div>
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-800">
									Preferred Qualifications
								</span>
								<RichTextEditor
									value={form.preferredQualifications}
									onChange={(value) =>
										setField(
											"preferredQualifications",
											value,
										)
									}
									placeholder="Nice-to-have skills and experience..."
								/>
							</label>
						</div>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Skills
						</h2>
					</CardHeader>
					<CardBody>
						<SkillSelector
							selectedSkills={form.skills}
							onChange={(skills) => setField("skills", skills)}
							label="Required Skills"
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Screening Thresholds
						</h2>
					</CardHeader>
					<CardBody className="grid gap-4 md:grid-cols-2">
						<Input
							label="Auto-Reject Threshold (%)"
							type="number"
							min={0}
							max={100}
							value={form.autoRejectThreshold}
							onChange={(e) =>
								setField("autoRejectThreshold", e.target.value)
							}
							required
						/>
						<Input
							label="Auto-Pass Threshold (%)"
							type="number"
							min={0}
							max={100}
							value={form.autoPassThreshold}
							onChange={(e) =>
								setField("autoPassThreshold", e.target.value)
							}
							required
						/>
					</CardBody>
				</Card>

				<Card>
					<CardHeader>
						<h2 className="text-sm font-semibold text-slate-900">
							Publishing
						</h2>
					</CardHeader>
					<CardBody>
						<SelectField
							label="Listing Status"
							value={form.status}
							options={JOB_STATUSES}
							onChange={(value) => setField("status", value)}
							required
						/>
					</CardBody>
				</Card>

				<div className="flex items-center gap-2">
					<Button type="submit" disabled={isCreating || isUpdating}>
						{isCreating || isUpdating
							? "Saving..."
							: isEdit
								? "Update listing"
								: "Create listing"}
					</Button>
					<Link to={ROUTES.JOB_LISTINGS}>
						<Button type="button" variant="secondary">
							Cancel
						</Button>
					</Link>
				</div>
			</form>
		</div>
	);
}

function SelectField({ label, value, onChange, options, required = false }) {
	return (
		<label className="block">
			<span className="mb-1 block text-sm font-medium text-slate-800">
				{label}
				{required && <span className="text-red-500">*</span>}
			</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
				required={required}
			>
				<option value="">Select {label.toLowerCase()}</option>
				{options.map(([optionValue, optionLabel]) => (
					<option key={optionValue} value={optionValue}>
						{optionLabel}
					</option>
				))}
			</select>
		</label>
	);
}

function defaultForm() {
	return {
		title: "",
		type: "FULL_TIME",
		location: "",
		summary: "<p></p>",
		responsibilities: "<p></p>",
		requiredQualifications: "<p></p>",
		preferredQualifications: "<p></p>",
		skills: [],
		autoRejectThreshold: "40",
		autoPassThreshold: "75",
		status: "DRAFT",
	};
}

function initForm(job) {
	if (!job) return defaultForm();
	return {
		title: job.title ?? "",
		type: job.type ?? "FULL_TIME",
		location: job.location ?? "",
		summary: job.summary ?? "<p></p>",
		responsibilities: job.responsibilities ?? "<p></p>",
		requiredQualifications: job.requiredQualifications ?? "<p></p>",
		preferredQualifications: job.preferredQualifications ?? "<p></p>",
		skills: job.skills ?? [],
		autoRejectThreshold: String(job.autoRejectThreshold ?? "40"),
		autoPassThreshold: String(job.autoPassThreshold ?? "75"),
		status: job.status ?? "DRAFT",
	};
}

export default JobListingFormPage;
