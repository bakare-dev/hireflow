import { PIPELINE_STAGES, STAGE_LABELS } from "./stages";

const stageLine = (current, next) =>
	`Current: ${STAGE_LABELS[current]} · Next: ${
		next ? STAGE_LABELS[next] : "N/A — Application Closed"
	}`;

export const NOTIFICATION_TEMPLATES = Object.freeze({
	APPLIED: ({ jobTitle, companyName }) => ({
		subject: `Application received — ${jobTitle} at ${companyName}`,
		body: `Thanks for applying to ${jobTitle} at ${companyName}. Your application is now under review.\n\n${stageLine(
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
		)} (AI review in progress)`,
	}),

	INTERVIEW_SCHEDULED: ({
		jobTitle,
		companyName,
		scheduledAt,
		meetLink,
	}) => ({
		subject: `Interview invite — ${jobTitle} at ${companyName}`,
		body: `Congratulations — you have been invited to interview for ${jobTitle} at ${companyName}.\n\nWhen: ${scheduledAt}\nGoogle Meet: ${meetLink}\n\n${stageLine(
			PIPELINE_STAGES.INTERVIEW_SCHEDULED,
			PIPELINE_STAGES.OFFER_SENT,
		)} (if successful)`,
	}),

	OFFER_SENT: ({ jobTitle, companyName }) => ({
		subject: `Offer details — ${jobTitle} at ${companyName}`,
		body: `An offer is on its way for ${jobTitle} at ${companyName}.\n\n${stageLine(
			PIPELINE_STAGES.OFFER_SENT,
			PIPELINE_STAGES.HIRED,
		)} (pending acceptance)`,
	}),

	HIRED: ({ jobTitle, companyName }) => ({
		subject: `Welcome to ${companyName}`,
		body: `Welcome aboard! Your application for ${jobTitle} at ${companyName} has been accepted.\n\n${stageLine(
			PIPELINE_STAGES.HIRED,
			null,
		)}\nNext: Onboarding (handled externally).`,
	}),

	REJECTED_AUTO: ({ jobTitle, companyName, unmatchedSkills }) => ({
		subject: `Your application for ${jobTitle} at ${companyName}`,
		body: `Thank you for applying to ${jobTitle} at ${companyName}.\n\nUnfortunately your application did not meet the role's requirements. Specifically, the following skills were missing: ${
			unmatchedSkills.join(", ") || "requirements not met"
		}.\n\nWe encourage you to apply for future roles that match your experience.\n\n${stageLine(
			PIPELINE_STAGES.REJECTED,
			null,
		)}`,
	}),

	REJECTED_MANUAL: ({ jobTitle, companyName, reason }) => ({
		subject: `Your application for ${jobTitle} at ${companyName}`,
		body: `Thank you for applying to ${jobTitle} at ${companyName}. Your application was reviewed by our team and we have decided not to move forward at this time.\n\nReason: ${reason}\n\n${stageLine(
			PIPELINE_STAGES.REJECTED,
			null,
		)}`,
	}),
});
