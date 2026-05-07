import { PIPELINE_STAGES } from "../constants/stages";
import { NOTIFICATION_TEMPLATES } from "../constants/notificationTemplates";
import {
	SEED_APPLICATIONS,
	SEED_STAGE_UPDATES,
	SEED_INTERVIEW_SLOTS,
} from "./applications";
import { SEED_JOB_LISTINGS } from "./jobListings";
import { SEED_COMPANIES } from "./companies";
import { formatDateTime } from "../utils/date";

const companyById = new Map(SEED_COMPANIES.map((c) => [c.id, c]));
const jobById = new Map(SEED_JOB_LISTINGS.map((j) => [j.id, j]));
const slotByApplicationId = new Map(
	SEED_INTERVIEW_SLOTS.map((s) => [s.applicationId, s]),
);
const applicationById = new Map(SEED_APPLICATIONS.map((a) => [a.id, a]));

function templateFor(update, application, job, company) {
	const ctx = {
		jobTitle: job.title,
		companyName: company.name,
	};

	switch (update.currentStage) {
		case PIPELINE_STAGES.SCREENING:
			return NOTIFICATION_TEMPLATES.APPLIED(ctx);
		case PIPELINE_STAGES.INTERVIEW_SCHEDULED: {
			const slot = slotByApplicationId.get(application.id);
			return NOTIFICATION_TEMPLATES.INTERVIEW_SCHEDULED({
				...ctx,
				scheduledAt: slot ? formatDateTime(slot.scheduledAt) : "TBD",
				meetLink: slot?.meetLink ?? "",
			});
		}
		case PIPELINE_STAGES.OFFER_SENT:
			return NOTIFICATION_TEMPLATES.OFFER_SENT(ctx);
		case PIPELINE_STAGES.HIRED:
			return NOTIFICATION_TEMPLATES.HIRED(ctx);
		case PIPELINE_STAGES.REJECTED:
			if (update.unmatchedSkills?.length) {
				return NOTIFICATION_TEMPLATES.REJECTED_AUTO({
					...ctx,
					unmatchedSkills: update.unmatchedSkills,
				});
			}
			return NOTIFICATION_TEMPLATES.REJECTED_MANUAL({
				...ctx,
				reason: update.reason ?? "",
			});
		default:
			return null;
	}
}

export const SEED_NOTIFICATIONS = SEED_STAGE_UPDATES.flatMap((update) => {
	const application = applicationById.get(update.applicationId);
	if (!application) return [];
	const job = jobById.get(application.jobListingId);
	const company = job ? companyById.get(job.companyId) : null;
	if (!job || !company) return [];

	const tpl = templateFor(update, application, job, company);
	if (!tpl) return [];

	return [
		{
			id: `notif_${update.id}`,
			applicationId: application.id,
			recipientUserId: application.applicantId,
			subject: tpl.subject,
			currentStage: update.currentStage,
			nextStage: update.nextStage,
			body: tpl.body,
			unmatchedSkills: update.unmatchedSkills,
			reason: update.reason,
			sentAt: update.occurredAt,
		},
	];
});
