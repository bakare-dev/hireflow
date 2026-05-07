import {
	NEXT_STAGE_MAP,
	PIPELINE_STAGES,
	STAGE_LABELS,
} from "../constants/stages";
import {
	EMPLOYMENT_TYPE_LABELS,
	WORK_MODE_LABELS,
	WORK_MODES,
} from "../constants/employment";
import { formatDate, formatDateTime, formatRelative } from "./date";

export function formatSalary(salary) {
	if (!salary) return "Salary not listed";
	const formatter = new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: salary.currency,
		maximumFractionDigits: 0,
	});
	return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
}

export function postedLabel(date) {
	return date ? `Posted ${formatRelative(date)}` : "Recently posted";
}

export function workModeLabel(mode) {
	return WORK_MODE_LABELS[mode] ?? mode;
}

export function employmentTypeLabel(type) {
	return EMPLOYMENT_TYPE_LABELS[type] ?? type;
}

export function computeMatchPercent(job, user) {
	const required = job?.requiredSkills ?? [];
	if (!required.length) return 0;
	const userSkills = new Set(
		(user?.skills ?? []).map((skill) => skill.toLowerCase()),
	);
	const matched = required.filter((skill) =>
		userSkills.has(skill.toLowerCase()),
	);
	return Math.round((matched.length / required.length) * 100);
}

export function matchSkills(job, user) {
	const userSkills = new Set(
		(user?.skills ?? []).map((skill) => skill.toLowerCase()),
	);
	return {
		matched: (job?.requiredSkills ?? []).filter((skill) =>
			userSkills.has(skill.toLowerCase()),
		),
		unmatched: (job?.requiredSkills ?? []).filter(
			(skill) => !userSkills.has(skill.toLowerCase()),
		),
	};
}

export function applicationForJob(applications, jobId, userId) {
	return applications.find(
		(app) => app.jobListingId === jobId && app.applicantId === userId,
	);
}

export function nextStageLabel(stage) {
	const next = NEXT_STAGE_MAP[stage];
	return next ? STAGE_LABELS[next] : "Complete";
}

export function applicationStatusText(application) {
	if (!application) return null;
	const current =
		STAGE_LABELS[application.currentStage] ?? application.currentStage;
	const next = nextStageLabel(application.currentStage);
	return `${current} · Next: ${next}`;
}

export function stageEta(stage) {
	switch (stage) {
		case PIPELINE_STAGES.APPLIED:
			return "Usually reviewed within 2 days";
		case PIPELINE_STAGES.SCREENING:
			return "Hiring team review is usually 3-5 days";
		case PIPELINE_STAGES.INTERVIEW_SCHEDULED:
			return "Your interview is the next step";
		case PIPELINE_STAGES.OFFER_SENT:
			return "Offer response is waiting for you";
		case PIPELINE_STAGES.HIRED:
			return "You reached the final stage";
		case PIPELINE_STAGES.REJECTED:
			return "This application is closed";
		default:
			return "We will keep you posted";
	}
}

export function stageNarrative(stage, jobTitle) {
	switch (stage) {
		case PIPELINE_STAGES.APPLIED:
			return `Your application for ${jobTitle} was received.`;
		case PIPELINE_STAGES.SCREENING:
			return `Your application is under review by the ${jobTitle} hiring team.`;
		case PIPELINE_STAGES.INTERVIEW_SCHEDULED:
			return `The team wants to meet you for ${jobTitle}.`;
		case PIPELINE_STAGES.OFFER_SENT:
			return `You have an offer for ${jobTitle}.`;
		case PIPELINE_STAGES.HIRED:
			return `You were hired for ${jobTitle}.`;
		case PIPELINE_STAGES.REJECTED:
			return `The ${jobTitle} application has closed.`;
		default:
			return `Your ${jobTitle} application is being updated.`;
	}
}

export function interviewerLabel(slot) {
	return slot ? "Hiring team" : "Recruiting team";
}

export function interviewTime(slot) {
	return slot ? formatDateTime(slot.scheduledAt) : "Not scheduled yet";
}

export function applicationLastUpdated(application) {
	return application?.updatedAt
		? formatDate(application.updatedAt)
		: "No updates yet";
}

export function isRemote(job) {
	return job?.workMode === WORK_MODES.REMOTE;
}

export function jobSearchText(job) {
	return [
		job.title,
		job.location,
		workModeLabel(job.workMode),
		employmentTypeLabel(job.employmentType),
		...(job.requiredSkills ?? []),
		...(job.niceToHaveSkills ?? []),
	]
		.join(" ")
		.toLowerCase();
}

export function csvToList(value) {
	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

export function buildParsedResume(user) {
	const skills = user?.skills ?? [];
	const yearsOfExperience = Math.max(1, Math.min(12, skills.length + 1));
	return {
		name: user?.name ?? "",
		email: user?.email ?? "",
		yearsOfExperience,
		professionalSummary:
			"Product-minded professional with experience shipping reliable user-facing work and collaborating across design, product, and engineering.",
		skills: skills.join(", "),
		workExperience:
			"Frontend Engineer - Acme Projects (2022-Present)\nBuilt and maintained applicant-facing experiences with strong attention to UX clarity and accessibility.\n\nSoftware Engineer - Product Studio (2020-2022)\nDelivered web features, partnered with cross-functional teams, and improved release quality.",
	};
}
