import { SEED_AI_RESULTS, SEED_STAGE_UPDATES, SEED_USERS } from "../../data";
import { JOB_LISTING_STATUS } from "../../constants/jobStatus";
import { PIPELINE_STAGES, STAGE_ORDER } from "../../constants/stages";

export function avg(values) {
	if (!values.length) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getUserMap() {
	return new Map(SEED_USERS.map((user) => [user.id, user]));
}

export function aiByApplicationId() {
	return new Map(SEED_AI_RESULTS.map((item) => [item.applicationId, item]));
}

export function stageUpdatesByApplicationId() {
	const grouped = new Map();
	for (const update of SEED_STAGE_UPDATES) {
		const list = grouped.get(update.applicationId) ?? [];
		list.push(update);
		grouped.set(update.applicationId, list);
	}
	return grouped;
}

export function roleScopedJobs(jobs, role, user) {
	if (!user) return [];
	if (role === "ADMIN") return jobs;
	return jobs.filter((job) => job.hiringManagerId === user.id);
}

export function roleScopedApplications(applications, jobs, role, user) {
	if (!user) return [];
	if (role === "ADMIN") return applications;
	const jobIds = new Set(
		jobs.filter((job) => job.hiringManagerId === user.id).map((job) => job.id),
	);
	return applications.filter((app) => jobIds.has(app.jobListingId));
}

export function openRolesCount(jobs) {
	return jobs.filter((job) => job.status === JOB_LISTING_STATUS.OPEN).length;
}

export function stageCounts(applications) {
	const counts = {
		[PIPELINE_STAGES.APPLIED]: 0,
		[PIPELINE_STAGES.SCREENING]: 0,
		[PIPELINE_STAGES.INTERVIEW_SCHEDULED]: 0,
		[PIPELINE_STAGES.OFFER_SENT]: 0,
		[PIPELINE_STAGES.HIRED]: 0,
		[PIPELINE_STAGES.REJECTED]: 0,
	};
	for (const app of applications) {
		if (counts[app.currentStage] !== undefined) counts[app.currentStage] += 1;
	}
	return counts;
}

export function avgAiMatchForJob(jobId, applications) {
	const scopedApps = applications.filter((app) => app.jobListingId === jobId);
	const aiMap = aiByApplicationId();
	const scores = scopedApps
		.map((app) => aiMap.get(app.id)?.matchPercentage ?? null)
		.filter((score) => score !== null);
	return Math.round(avg(scores));
}

export function kpiSnapshot({ jobs, applications, interviews }) {
	const funnel = stageCounts(applications);
	const openRoles = openRolesCount(jobs);
	const activeCandidates = applications.filter(
		(app) =>
			![PIPELINE_STAGES.HIRED, PIPELINE_STAGES.REJECTED].includes(
				app.currentStage,
			),
	).length;
	const now = Date.now();
	const weekMs = 7 * 24 * 60 * 60 * 1000;
	const interviewsThisWeek = interviews.filter((slot) => {
		const time = new Date(slot.scheduledAt).getTime();
		return time >= now && time <= now + weekMs;
	}).length;
	const offersPending = funnel[PIPELINE_STAGES.OFFER_SENT];
	const hired = funnel[PIPELINE_STAGES.HIRED];
	const velocity = openRoles ? Math.round((hired / openRoles) * 100) : 0;
	return {
		openRoles,
		activeCandidates,
		interviewsThisWeek,
		offersPending,
		avgTimeToHireDays: 23,
		hiringVelocity: velocity,
		funnel,
	};
}

export function orderedFunnel(funnel) {
	return [...STAGE_ORDER, PIPELINE_STAGES.REJECTED].map((stage) => ({
		stage,
		value: funnel[stage] ?? 0,
	}));
}

export function stageEta(stage) {
	switch (stage) {
		case PIPELINE_STAGES.APPLIED:
			return "Awaiting screening review";
		case PIPELINE_STAGES.SCREENING:
			return "AI/Recruiter screening in progress";
		case PIPELINE_STAGES.INTERVIEW_SCHEDULED:
			return "Interview loop active";
		case PIPELINE_STAGES.OFFER_SENT:
			return "Offer decision pending";
		case PIPELINE_STAGES.HIRED:
			return "Closed as hired";
		case PIPELINE_STAGES.REJECTED:
			return "Closed as rejected";
		default:
			return "Pipeline update pending";
	}
}
