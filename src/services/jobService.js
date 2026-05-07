import { db } from "./db";
import { simulateLatency } from "../utils/async";
import { newId } from "../utils/id";
import { nowIso } from "../utils/date";
import {
	JOB_LISTING_STATUS,
	canTransitionJobStatus,
} from "../constants/jobStatus";

export async function listJobs({ status, companyId } = {}) {
	await simulateLatency();
	return db.jobListings
		.filter((j) => (status ? j.status === status : true))
		.filter((j) => (companyId ? j.companyId === companyId : true))
		.map((j) => ({ ...j }));
}

export async function listOpenJobs() {
	return listJobs({ status: JOB_LISTING_STATUS.OPEN });
}

export async function getJob(id) {
	await simulateLatency();
	const job = db.jobListings.find((j) => j.id === id);
	if (!job) throw new Error(`Job not found: ${id}`);
	return { ...job };
}

export async function createJob(input) {
	await simulateLatency();
	const job = {
		id: newId("job"),
		status: JOB_LISTING_STATUS.DRAFT,
		createdAt: nowIso(),
		updatedAt: nowIso(),
		...input,
	};
	db.jobListings.push(job);
	return { ...job };
}

export async function updateJob(id, patch) {
	await simulateLatency();
	const idx = db.jobListings.findIndex((j) => j.id === id);
	if (idx === -1) throw new Error(`Job not found: ${id}`);
	const next = { ...db.jobListings[idx], ...patch, updatedAt: nowIso() };
	db.jobListings[idx] = next;
	return { ...next };
}

export async function transitionJobStatus(id, nextStatus) {
	const current = await getJob(id);
	if (!canTransitionJobStatus(current.status, nextStatus)) {
		throw new Error(
			`Illegal job status transition: ${current.status} → ${nextStatus}`,
		);
	}
	return updateJob(id, { status: nextStatus });
}

export async function markJobFilled(id) {
	return updateJob(id, { status: JOB_LISTING_STATUS.FILLED });
}
