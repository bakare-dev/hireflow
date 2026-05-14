export const ROUTES = Object.freeze({
	LANDING: "/",
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
	ACCEPT_INVITE: "/accept-invite",
	COMPANY_SETUP: "/company-setup",
	NOT_FOUND: "*",

	APPLICANT_HOME: "/applicant/jobs",
	APPLICANT_JOBS: "/applicant/jobs",
	APPLICANT_JOB_DETAIL: (id = ":id") => `/applicant/jobs/${id}`,
	APPLICANT_APPLICATIONS: "/applicant/applications",
	APPLICANT_APPLICATION: (id = ":id") => `/applicant/applications/${id}`,
	APPLICANT_INTERVIEWS: "/applicant/interviews",
	APPLICANT_PROFILE: "/applicant/profile",

	DASHBOARD: "/dashboard",
	JOB_LISTINGS: "/job-listings",
	JOB_LISTING_NEW: "/job-listings/new",
	JOB_LISTING_EDIT: (id = ":id") => `/job-listings/${id}/edit`,
	JOB_DETAIL: (id = ":id") => `/job-listings/${id}`,
	JOB_APPLICATIONS: (id = ":id") => `/job-listings/${id}/applications`,
	JOB_APPLICATION_DETAIL: (jobId = ":id", applicationId = ":applicationId") =>
		`/job-listings/${jobId}/applications/${applicationId}`,
	TEAM_MANAGEMENT: "/team-management",
	SCORECARD_TEMPLATES: "/scorecard-templates",
	AUDIT_LOGS: "/audit-logs",

	LEGACY_HM_HOME: "/hm",
	LEGACY_ADMIN_HOME: "/admin",
});
