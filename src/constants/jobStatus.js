export const JOB_LISTING_STATUS = Object.freeze({
	DRAFT: "DRAFT",
	OPEN: "OPEN",
	PAUSED: "PAUSED",
	CLOSED: "CLOSED",
	FILLED: "FILLED",
});

export const JOB_STATUS_LABELS = Object.freeze({
	[JOB_LISTING_STATUS.DRAFT]: "Draft",
	[JOB_LISTING_STATUS.OPEN]: "Open",
	[JOB_LISTING_STATUS.PAUSED]: "Paused",
	[JOB_LISTING_STATUS.CLOSED]: "Closed",
	[JOB_LISTING_STATUS.FILLED]: "Filled",
});

export const JOB_STATUS_BADGE_COLORS = Object.freeze({
	[JOB_LISTING_STATUS.DRAFT]: "bg-slate-100 text-slate-700 ring-slate-200",
	[JOB_LISTING_STATUS.OPEN]:
		"bg-emerald-100 text-emerald-700 ring-emerald-200",
	[JOB_LISTING_STATUS.PAUSED]: "bg-amber-100 text-amber-800 ring-amber-200",
	[JOB_LISTING_STATUS.CLOSED]: "bg-rose-100 text-rose-700 ring-rose-200",
	[JOB_LISTING_STATUS.FILLED]:
		"bg-indigo-100 text-indigo-700 ring-indigo-200",
});

export const JOB_STATUS_TRANSITIONS = Object.freeze({
	[JOB_LISTING_STATUS.DRAFT]: [JOB_LISTING_STATUS.OPEN],
	[JOB_LISTING_STATUS.OPEN]: [
		JOB_LISTING_STATUS.PAUSED,
		JOB_LISTING_STATUS.CLOSED,
	],
	[JOB_LISTING_STATUS.PAUSED]: [
		JOB_LISTING_STATUS.OPEN,
		JOB_LISTING_STATUS.CLOSED,
	],
	[JOB_LISTING_STATUS.CLOSED]: [],
	[JOB_LISTING_STATUS.FILLED]: [],
});

export function canTransitionJobStatus(from, to) {
	return JOB_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
