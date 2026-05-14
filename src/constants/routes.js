export const ROUTES = Object.freeze({
	LANDING: "/",
	SIGN_IN: "/sign-in",
	SIGN_UP: "/sign-up",
	PASSWORD_RESET: "/password-reset",
	ACCEPT_INVITE: "/accept-invite",
	COMPANY_SETUP: "/company-setup",
	NOT_FOUND: "*",

	APPLICANT_HOME: "/applicant/jobs",
	APPLICANT_JOBS: "/applicant/jobs",
	APPLICANT_JOB_DETAIL: (id = ":id") => `/applicant/jobs/${id}`,
	APPLICANT_APPLICATIONS: "/applicant/applications",
	APPLICANT_APPLICATION: (id = ":id") =>
		`/applicant/applications/${id}`,
	APPLICANT_MESSAGES: "/applicant/messages",
	APPLICANT_INTERVIEWS: "/applicant/interviews",
	APPLICANT_PROFILE: "/applicant/profile",
	APPLICANT_COMPANY_REVIEWS: "/applicant/company-reviews",
	APPLICANT_COMPANY_PROFILE: (companyId = ":companyId") =>
		`/applicant/company-reviews/${companyId}`,
	APPLICANT_COMPANY_REVIEWS_LIST: (companyId = ":companyId") =>
		`/applicant/company-reviews/${companyId}/reviews`,
	APPLICANT_COMPANY_REVIEW_NEW: (companyId = ":companyId") =>
		`/applicant/company-reviews/${companyId}/write`,
	APPLICANT_COMPANY_REVIEW_TYPE: (companyId = ":companyId") =>
		`/applicant/company-reviews/${companyId}/write/type`,
	APPLICANT_COMPANY_REVIEW_SUBMIT: (companyId = ":companyId") =>
		`/applicant/company-reviews/${companyId}/write/submit`,

	DASHBOARD: "/dashboard",
	JOB_LISTINGS: "/job-listings",
	JOB_LISTING_NEW: "/job-listings/new",
	JOB_LISTING_EDIT: (id = ":id") => `/job-listings/${id}/edit`,
	JOB_DETAIL: (id = ":id") => `/job-listings/${id}`,
	JOB_APPLICATIONS: (id = ":id") => `/job-listings/${id}/applications`,
	JOB_APPLICATION_DETAIL: (jobId = ":id", applicationId = ":applicationId") =>
		`/job-listings/${jobId}/applications/${applicationId}`,
	CANDIDATES: "/candidates",
	INTERVIEWS: "/interviews",
	INTERVIEW_FEEDBACK: (id = ":id") => `/interviews/${id}/feedback`,
	OFFERS: "/offers",
	AI_SCREENING: "/ai-screening",
	ANALYTICS: "/analytics",
	MESSAGES: "/messages",
	NOTIFICATIONS: "/notifications",
	TEAM_MANAGEMENT: "/team-management",
	SCORECARD_TEMPLATES: "/scorecard-templates",
	REVIEW_MODERATION: "/review-moderation",
	AUDIT_LOGS: "/audit-logs",
	ORGANIZATION_SETTINGS: "/organization-settings",

	LEGACY_HM_HOME: "/hm",
	LEGACY_ADMIN_HOME: "/admin",
});
