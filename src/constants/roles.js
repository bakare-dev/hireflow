export const USER_ROLES = Object.freeze({
	APPLICANT: "APPLICANT",
	HIRING_MANAGER: "HIRING_MANAGER",
	ADMIN: "ADMIN",
});

export const ROLE_LABELS = Object.freeze({
	[USER_ROLES.APPLICANT]: "Applicant",
	[USER_ROLES.HIRING_MANAGER]: "Hiring Manager",
	[USER_ROLES.ADMIN]: "Admin",
});

export const ACTOR_ROLES = Object.freeze({
	APPLICANT: "APPLICANT",
	HIRING_MANAGER: "HIRING_MANAGER",
	SYSTEM: "SYSTEM",
});

export const ROLE_HOME_PATHS = Object.freeze({
	[USER_ROLES.APPLICANT]: "/jobs",
	[USER_ROLES.HIRING_MANAGER]: "/hm",
	[USER_ROLES.ADMIN]: "/admin",
});
