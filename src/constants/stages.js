export const PIPELINE_STAGES = Object.freeze({
	APPLIED: "APPLIED",
	SCREENING: "SCREENING",
	INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
	OFFER_SENT: "OFFER_SENT",
	HIRED: "HIRED",
	REJECTED: "REJECTED",
});

export const STAGE_LABELS = Object.freeze({
	[PIPELINE_STAGES.APPLIED]: "Applied",
	[PIPELINE_STAGES.SCREENING]: "Screening",
	[PIPELINE_STAGES.INTERVIEW_SCHEDULED]: "Interview Scheduled",
	[PIPELINE_STAGES.OFFER_SENT]: "Offer Sent",
	[PIPELINE_STAGES.HIRED]: "Hired",
	[PIPELINE_STAGES.REJECTED]: "Rejected",
	AI_SCREENING: "AI Screening",
	AI_PASSED: "AI Passed",
	AI_REJECTED: "AI Rejected",
	UNDER_REVIEW: "Under Review",
	SHORTLISTED: "Shortlisted",
	INTERVIEW: "Interview",
	OFFER: "Offer",
	WITHDRAWN: "Withdrawn",
});

export const STAGE_ORDER = Object.freeze([
	PIPELINE_STAGES.APPLIED,
	PIPELINE_STAGES.SCREENING,
	PIPELINE_STAGES.INTERVIEW_SCHEDULED,
	PIPELINE_STAGES.OFFER_SENT,
	PIPELINE_STAGES.HIRED,
]);

export const NEXT_STAGE_MAP = Object.freeze({
	[PIPELINE_STAGES.APPLIED]: PIPELINE_STAGES.SCREENING,
	[PIPELINE_STAGES.SCREENING]: PIPELINE_STAGES.INTERVIEW_SCHEDULED,
	[PIPELINE_STAGES.INTERVIEW_SCHEDULED]: PIPELINE_STAGES.OFFER_SENT,
	[PIPELINE_STAGES.OFFER_SENT]: PIPELINE_STAGES.HIRED,
	[PIPELINE_STAGES.HIRED]: null,
	[PIPELINE_STAGES.REJECTED]: null,
});

export const TERMINAL_STAGES = Object.freeze([
	PIPELINE_STAGES.HIRED,
	PIPELINE_STAGES.REJECTED,
]);

export const STAGE_BADGE_COLORS = Object.freeze({
	[PIPELINE_STAGES.APPLIED]: "bg-blue-100 text-blue-700 ring-blue-200",
	[PIPELINE_STAGES.SCREENING]:
		"bg-violet-100 text-violet-700 ring-violet-200",
	[PIPELINE_STAGES.INTERVIEW_SCHEDULED]:
		"bg-teal-100 text-teal-700 ring-teal-200",
	[PIPELINE_STAGES.OFFER_SENT]: "bg-amber-100 text-amber-800 ring-amber-200",
	[PIPELINE_STAGES.HIRED]: "bg-emerald-100 text-emerald-700 ring-emerald-200",
	[PIPELINE_STAGES.REJECTED]: "bg-rose-100 text-rose-700 ring-rose-200",
	AI_SCREENING: "bg-violet-100 text-violet-700 ring-violet-200",
	AI_PASSED: "bg-violet-100 text-violet-700 ring-violet-200",
	AI_REJECTED: "bg-rose-100 text-rose-700 ring-rose-200",
	UNDER_REVIEW: "bg-violet-100 text-violet-700 ring-violet-200",
	SHORTLISTED: "bg-sky-100 text-sky-700 ring-sky-200",
	INTERVIEW: "bg-teal-100 text-teal-700 ring-teal-200",
	OFFER: "bg-amber-100 text-amber-800 ring-amber-200",
	WITHDRAWN: "bg-slate-100 text-slate-700 ring-slate-200",
});

export const API_TERMINAL_STAGES = Object.freeze([
	"HIRED",
	"REJECTED",
	"AI_REJECTED",
	"WITHDRAWN",
]);

export const API_OFFER_STAGES = Object.freeze(["OFFER", "HIRED"]);

export function isTerminalStage(stage) {
	return TERMINAL_STAGES.includes(stage);
}
