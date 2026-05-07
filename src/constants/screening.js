export const DEFAULT_AUTO_PASS_THRESHOLD = 75;
export const DEFAULT_AUTO_REJECT_THRESHOLD = 40;

export const MATCH_BAND = Object.freeze({
	HIGH: "HIGH",
	MID: "MID",
	LOW: "LOW",
});

export function classifyMatch(
	matchPercentage,
	autoPassThreshold = DEFAULT_AUTO_PASS_THRESHOLD,
	autoRejectThreshold = DEFAULT_AUTO_REJECT_THRESHOLD,
) {
	if (matchPercentage >= autoPassThreshold) return MATCH_BAND.HIGH;
	if (matchPercentage < autoRejectThreshold) return MATCH_BAND.LOW;
	return MATCH_BAND.MID;
}
