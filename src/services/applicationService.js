import { db } from "./db";
import { simulateLatency } from "../utils/async";
import { newId } from "../utils/id";
import { nowIso } from "../utils/date";
import {
	PIPELINE_STAGES,
	NEXT_STAGE_MAP,
	STAGE_ORDER,
	isTerminalStage,
} from "../constants/stages";
import { ACTOR_ROLES } from "../constants/roles";
import { isNonEmpty } from "../utils/validators";
import { markJobFilled } from "./jobService";
import { emitNotificationForUpdate } from "./notificationService";

export async function listApplications({ applicantId, jobListingId } = {}) {
	await simulateLatency();
	return db.applications
		.filter((a) => (applicantId ? a.applicantId === applicantId : true))
		.filter((a) => (jobListingId ? a.jobListingId === jobListingId : true))
		.map((a) => ({ ...a }));
}

export async function getApplication(id) {
	await simulateLatency();
	const application = db.applications.find((a) => a.id === id);
	if (!application) throw new Error(`Application not found: ${id}`);
	return { ...application };
}

export async function listStageUpdates(applicationId) {
	await simulateLatency();
	return db.stageUpdates
		.filter((u) => u.applicationId === applicationId)
		.sort((a, b) => (a.occurredAt < b.occurredAt ? -1 : 1))
		.map((u) => ({ ...u }));
}

export async function applyToJob({ applicantId, jobListingId }) {
	await simulateLatency();

	const duplicate = db.applications.some(
		(a) => a.applicantId === applicantId && a.jobListingId === jobListingId,
	);
	if (duplicate) {
		const err = new Error("You have already applied to this role.");
		err.code = "DUPLICATE_APPLICATION";
		throw err;
	}

	const job = db.jobListings.find((j) => j.id === jobListingId);
	if (!job) throw new Error(`Job not found: ${jobListingId}`);

	const application = {
		id: newId("app"),
		applicantId,
		jobListingId,
		currentStage: PIPELINE_STAGES.APPLIED,
		appliedAt: nowIso(),
		updatedAt: nowIso(),
	};
	db.applications.push(application);

	await recordStageTransition({
		application,
		previousStage: null,
		currentStage: PIPELINE_STAGES.APPLIED,
		actorId: applicantId,
		actorRole: ACTOR_ROLES.APPLICANT,
	});

	return { ...application };
}

export async function transitionStage({
	applicationId,
	nextStage,
	actorId,
	actorRole,
	reason,
	unmatchedSkills,
}) {
	const application = await getApplication(applicationId);

	if (isTerminalStage(application.currentStage)) {
		throw new Error("Application is in a terminal stage.");
	}

	const fromIdx = STAGE_ORDER.indexOf(application.currentStage);
	const toIdx = STAGE_ORDER.indexOf(nextStage);
	const isReject = nextStage === PIPELINE_STAGES.REJECTED;
	const isForward = isReject ? true : fromIdx >= 0 && toIdx > fromIdx;
	if (!isForward) {
		throw new Error(
			`Illegal stage transition: ${application.currentStage} → ${nextStage}`,
		);
	}

	if (isReject && !isNonEmpty(reason)) {
		throw new Error("A rejection reason is required.");
	}

	const previousStage = application.currentStage;
	const updatedAt = nowIso();
	const idx = db.applications.findIndex((a) => a.id === applicationId);
	db.applications[idx] = {
		...application,
		currentStage: nextStage,
		updatedAt,
	};

	await recordStageTransition({
		application: db.applications[idx],
		previousStage,
		currentStage: nextStage,
		actorId,
		actorRole,
		reason,
		unmatchedSkills,
	});

	if (nextStage === PIPELINE_STAGES.HIRED) {
		await markJobFilled(application.jobListingId);
	}

	return { ...db.applications[idx] };
}

async function recordStageTransition({
	application,
	previousStage,
	currentStage,
	actorId,
	actorRole,
	reason,
	unmatchedSkills,
}) {
	const update = {
		id: newId("stu"),
		applicationId: application.id,
		previousStage,
		currentStage,
		nextStage: NEXT_STAGE_MAP[currentStage] ?? null,
		actorId,
		actorRole,
		reason,
		unmatchedSkills,
		occurredAt: nowIso(),
	};
	db.stageUpdates.push(update);

	const job = db.jobListings.find((j) => j.id === application.jobListingId);
	const company = job
		? db.companies.find((c) => c.id === job.companyId)
		: null;
	if (job && company) {
		await emitNotificationForUpdate({
			update,
			application,
			jobListing: job,
			company,
		});
	}

	return update;
}
