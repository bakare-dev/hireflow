import {
	SEED_COMPANIES,
	SEED_USERS,
	SEED_JOB_LISTINGS,
	SEED_APPLICATIONS,
	SEED_STAGE_UPDATES,
	SEED_INTERVIEW_SLOTS,
	SEED_AI_RESULTS,
	SEED_NOTIFICATIONS,
} from "../data";
export const db = {
	companies: [...SEED_COMPANIES],
	users: [...SEED_USERS],
	jobListings: [...SEED_JOB_LISTINGS],
	applications: [...SEED_APPLICATIONS],
	stageUpdates: [...SEED_STAGE_UPDATES],
	interviewSlots: [...SEED_INTERVIEW_SLOTS],
	aiResults: [...SEED_AI_RESULTS],
	notifications: [...SEED_NOTIFICATIONS],
};
