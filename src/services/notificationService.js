import { db } from "./db";
import { simulateLatency } from "../utils/async";
import { newId } from "../utils/id";
import { nowIso } from "../utils/date";
import { NOTIFICATION_TEMPLATES } from "../constants/notificationTemplates";
import { PIPELINE_STAGES } from "../constants/stages";
import { formatDateTime } from "../utils/date";

export async function listNotificationsForUser(userId) {
	await simulateLatency();
	return db.notifications
		.filter((n) => n.recipientUserId === userId)
		.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1))
		.map((n) => ({ ...n }));
}

export async function emitNotificationForUpdate({
	update,
	application,
	jobListing,
	company,
}) {
	const ctx = { jobTitle: jobListing.title, companyName: company.name };
	let tpl;

	switch (update.currentStage) {
		case PIPELINE_STAGES.SCREENING:
			tpl = NOTIFICATION_TEMPLATES.APPLIED(ctx);
			break;
		case PIPELINE_STAGES.INTERVIEW_SCHEDULED: {
			const slot = db.interviewSlots.find(
				(s) => s.applicationId === application.id,
			);
			tpl = NOTIFICATION_TEMPLATES.INTERVIEW_SCHEDULED({
				...ctx,
				scheduledAt: slot ? formatDateTime(slot.scheduledAt) : "TBD",
				meetLink: slot?.meetLink ?? "",
			});
			break;
		}
		case PIPELINE_STAGES.OFFER_SENT:
			tpl = NOTIFICATION_TEMPLATES.OFFER_SENT(ctx);
			break;
		case PIPELINE_STAGES.HIRED:
			tpl = NOTIFICATION_TEMPLATES.HIRED(ctx);
			break;
		case PIPELINE_STAGES.REJECTED:
			tpl = update.unmatchedSkills?.length
				? NOTIFICATION_TEMPLATES.REJECTED_AUTO({
						...ctx,
						unmatchedSkills: update.unmatchedSkills,
					})
				: NOTIFICATION_TEMPLATES.REJECTED_MANUAL({
						...ctx,
						reason: update.reason ?? "",
					});
			break;
		default:
			return null;
	}

	const notification = {
		id: newId("notif"),
		applicationId: application.id,
		recipientUserId: application.applicantId,
		subject: tpl.subject,
		currentStage: update.currentStage,
		nextStage: update.nextStage,
		body: tpl.body,
		unmatchedSkills: update.unmatchedSkills,
		reason: update.reason,
		sentAt: update.occurredAt ?? nowIso(),
	};

	db.notifications.push(notification);
	return { ...notification };
}
