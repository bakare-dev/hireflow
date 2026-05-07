import { db } from "./db";
import { simulateLatency } from "../utils/async";
import { newId } from "../utils/id";
import { nowIso } from "../utils/date";

export async function getScreeningResultByApplication(applicationId) {
	await simulateLatency();
	const result = db.aiResults.find((r) => r.applicationId === applicationId);
	return result ? { ...result } : null;
}

export async function runAIScreening({ application, applicant, jobListing }) {
	await simulateLatency(300 + Math.random() * 400);

	const required = jobListing.requiredSkills.map((s) => s.toLowerCase());
	const applicantSkills = (applicant.skills ?? []).map((s) =>
		s.toLowerCase(),
	);

	const matched = jobListing.requiredSkills.filter((s) =>
		applicantSkills.includes(s.toLowerCase()),
	);
	const unmatched = jobListing.requiredSkills.filter(
		(s) => !applicantSkills.includes(s.toLowerCase()),
	);

	const matchPercentage = required.length
		? Math.round((matched.length / required.length) * 100)
		: 0;

	const summary =
		matchPercentage >= 75
			? `Strong alignment with the role's required skills (${matched.length}/${required.length} matched). Recommend advancing.`
			: matchPercentage >= 40
				? `Partial alignment — ${matched.length}/${required.length} required skills matched. Worth a manual review.`
				: `Significant gap against required skills (${matched.length}/${required.length} matched). Recommend declining.`;

	const result = {
		id: newId("ai"),
		applicationId: application.id,
		matchPercentage,
		matchedSkills: matched,
		unmatchedSkills: unmatched,
		summaryNote: summary,
		screenedAt: nowIso(),
	};
  
	const existingIdx = db.aiResults.findIndex(
		(r) => r.applicationId === application.id,
	);
	if (existingIdx === -1) db.aiResults.push(result);
	else db.aiResults[existingIdx] = result;

	return { ...result };
}
