import { PIPELINE_STAGES, NEXT_STAGE_MAP } from "../constants/stages";
import { ACTOR_ROLES } from "../constants/roles";
import { DECISION } from "../constants/scoresheet";
import { PRIMARY_APPLICANT_ID, PRIMARY_HM_ID } from "./users";

const APPLICATION_BLUEPRINTS = [
	{
		id: "app_priya_frontend",
		applicantId: PRIMARY_APPLICANT_ID,
		jobListingId: "job_frontend",
		currentStage: PIPELINE_STAGES.INTERVIEW_SCHEDULED,
		appliedAt: "2026-04-22T09:10:00.000Z",
		history: [
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
			PIPELINE_STAGES.INTERVIEW_SCHEDULED,
		],
		ai: {
			matchPercentage: 88,
			matched: ["React", "TypeScript", "Redux", "Tailwind"],
			unmatched: ["Testing"],
			summary:
				"Strong React fundamentals with extensive Redux experience. Resume light on automated testing — worth probing in interview.",
		},
		interview: {
			scheduledAt: "2026-05-09T14:00:00.000Z",
			durationMinutes: 45,
			meetLink: "https://meet.google.com/abc-defg-hij",
			scoresheet: null,
			reviewSubmittedAt: null,
		},
	},
	{
		id: "app_tomas_frontend",
		applicantId: "user_applicant_2",
		jobListingId: "job_frontend",
		currentStage: PIPELINE_STAGES.SCREENING,
		appliedAt: "2026-04-28T11:20:00.000Z",
		history: [PIPELINE_STAGES.APPLIED, PIPELINE_STAGES.SCREENING],
		ai: {
			matchPercentage: 62,
			matched: ["React", "TypeScript"],
			unmatched: ["Redux", "Testing", "Tailwind"],
			summary:
				"Solid Next.js and GraphQL background; missing required Redux and Tailwind exposure. Borderline candidate — flag for review.",
		},
	},
	{
		id: "app_rahul_frontend",
		applicantId: "user_applicant_6",
		jobListingId: "job_frontend",
		currentStage: PIPELINE_STAGES.REJECTED,
		appliedAt: "2026-04-29T08:00:00.000Z",
		history: [
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
			PIPELINE_STAGES.REJECTED,
		],
		rejection: {
			kind: "AUTO",
			reason: null,
		},
		ai: {
			matchPercentage: 28,
			matched: ["React"],
			unmatched: ["TypeScript", "Redux", "Testing", "Tailwind"],
			summary:
				"Junior-leaning resume — significant gap against required senior-level skills.",
		},
	},

	{
		id: "app_mei_backend",
		applicantId: "user_applicant_3",
		jobListingId: "job_backend",
		currentStage: PIPELINE_STAGES.OFFER_SENT,
		appliedAt: "2026-04-10T08:00:00.000Z",
		history: [
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
			PIPELINE_STAGES.INTERVIEW_SCHEDULED,
			PIPELINE_STAGES.OFFER_SENT,
		],
		ai: {
			matchPercentage: 92,
			matched: ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
			unmatched: ["Kafka"],
			summary:
				"Strong backend foundation with cloud experience. Brief Kafka exposure but eager to learn.",
		},
		interview: {
			scheduledAt: "2026-04-25T13:00:00.000Z",
			durationMinutes: 60,
			meetLink: "https://meet.google.com/xyz-1234-uvw",
			scoresheet: {
				technicalScore: 5,
				behaviouralScore: 4,
				communicationScore: 5,
				cultureFitScore: 4,
				problemSolvingScore: 5,
				overallRecommendation:
					"Excellent system design intuition and clear communicator. Ready for the team — extend an offer.",
				decision: DECISION.PASS,
			},
			reviewSubmittedAt: "2026-04-25T14:10:00.000Z",
		},
	},
	{
		id: "app_olu_backend",
		applicantId: "user_applicant_4",
		jobListingId: "job_backend",
		currentStage: PIPELINE_STAGES.INTERVIEW_SCHEDULED,
		appliedAt: "2026-04-18T08:00:00.000Z",
		history: [
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
			PIPELINE_STAGES.INTERVIEW_SCHEDULED,
		],
		ai: {
			matchPercentage: 76,
			matched: ["Kafka", "Microservices"],
			unmatched: ["Python", "Django", "PostgreSQL"],
			summary:
				"Different stack (Java) but identical patterns. Auto-passed; verify Python ramp during interview.",
		},
		interview: {
			scheduledAt: "2026-05-08T11:00:00.000Z",
			durationMinutes: 45,
			meetLink: "https://meet.google.com/qrs-tuvw-xyz",
			scoresheet: null,
			reviewSubmittedAt: null,
		},
	},
	{
		id: "app_jordan_backend",
		applicantId: "user_applicant_8",
		jobListingId: "job_backend",
		currentStage: PIPELINE_STAGES.REJECTED,
		appliedAt: "2026-04-15T08:00:00.000Z",
		history: [
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
			PIPELINE_STAGES.INTERVIEW_SCHEDULED,
			PIPELINE_STAGES.REJECTED,
		],
		rejection: {
			kind: "MANUAL",
			reason: "Strong infra background but interview revealed limited application-layer experience. Better fit for the DevOps role when it reopens.",
		},
		ai: {
			matchPercentage: 71,
			matched: ["AWS", "Kafka"],
			unmatched: ["Python", "Django", "PostgreSQL"],
			summary: "Heavy infra slant — flagged for manual review.",
		},
		interview: {
			scheduledAt: "2026-04-23T15:00:00.000Z",
			durationMinutes: 45,
			meetLink: "https://meet.google.com/lmn-opqr-stu",
			scoresheet: {
				technicalScore: 3,
				behaviouralScore: 4,
				communicationScore: 4,
				cultureFitScore: 4,
				problemSolvingScore: 3,
				overallRecommendation:
					"Personable and well-prepared, but technical gap on application-layer is too large for this role.",
				decision: DECISION.REJECT,
				rejectionReason:
					"Strong infra background but interview revealed limited application-layer experience. Better fit for the DevOps role when it reopens.",
			},
			reviewSubmittedAt: "2026-04-23T16:00:00.000Z",
		},
	},
	{
		id: "app_lena_designer",
		applicantId: "user_applicant_5",
		jobListingId: "job_designer",
		currentStage: PIPELINE_STAGES.SCREENING,
		appliedAt: "2026-02-15T09:00:00.000Z",
		history: [PIPELINE_STAGES.APPLIED, PIPELINE_STAGES.SCREENING],
		ai: {
			matchPercentage: 81,
			matched: ["Figma", "UX Research", "Design Systems", "Prototyping"],
			unmatched: [],
			summary:
				"Strong all-round portfolio. Auto-pass — schedule when listing reopens.",
		},
	},
	{
		id: "app_priya_mobile_filled",
		applicantId: PRIMARY_APPLICANT_ID,
		jobListingId: "job_mobile",
		currentStage: PIPELINE_STAGES.HIRED,
		appliedAt: "2026-01-05T09:00:00.000Z",
		history: [
			PIPELINE_STAGES.APPLIED,
			PIPELINE_STAGES.SCREENING,
			PIPELINE_STAGES.INTERVIEW_SCHEDULED,
			PIPELINE_STAGES.OFFER_SENT,
			PIPELINE_STAGES.HIRED,
		],
		ai: {
			matchPercentage: 95,
			matched: ["Swift", "iOS", "SwiftUI"],
			unmatched: [],
			summary:
				"Top-of-funnel candidate — strong in every required dimension.",
		},
		interview: {
			scheduledAt: "2026-02-15T13:00:00.000Z",
			durationMinutes: 60,
			meetLink: "https://meet.google.com/done-deal-1",
			scoresheet: {
				technicalScore: 5,
				behaviouralScore: 5,
				communicationScore: 5,
				cultureFitScore: 5,
				problemSolvingScore: 5,
				overallRecommendation: "Outstanding. Hire.",
				decision: DECISION.PASS,
			},
			reviewSubmittedAt: "2026-02-15T14:30:00.000Z",
		},
	},
];

function buildSeeds(blueprints) {
	const applications = [];
	const stageUpdates = [];
	const interviewSlots = [];
	const aiResults = [];

	for (const bp of blueprints) {
		const updatedAt = new Date(bp.appliedAt).getTime();
		const stageMs = 24 * 60 * 60 * 1000; // 1 day between stages, deterministic

		applications.push({
			id: bp.id,
			applicantId: bp.applicantId,
			jobListingId: bp.jobListingId,
			currentStage: bp.currentStage,
			appliedAt: bp.appliedAt,
			updatedAt: new Date(
				updatedAt + stageMs * Math.max(0, bp.history.length - 1),
			).toISOString(),
		});

		for (let i = 1; i < bp.history.length; i += 1) {
			const previousStage = bp.history[i - 1];
			const currentStage = bp.history[i];
			const occurredAt = new Date(updatedAt + stageMs * i).toISOString();
			const isReject = currentStage === PIPELINE_STAGES.REJECTED;
			const isAutoReject = isReject && bp.rejection?.kind === "AUTO";
			const isManualReject = isReject && bp.rejection?.kind === "MANUAL";

			stageUpdates.push({
				id: `stu_${bp.id}_${i}`,
				applicationId: bp.id,
				previousStage,
				currentStage,
				nextStage: NEXT_STAGE_MAP[currentStage] ?? null,
				actorId: isAutoReject
					? "system"
					: isManualReject
						? PRIMARY_HM_ID
						: actorForStage(currentStage, bp.applicantId),
				actorRole: isAutoReject
					? ACTOR_ROLES.SYSTEM
					: isManualReject
						? ACTOR_ROLES.HIRING_MANAGER
						: actorRoleForStage(currentStage),
				reason: isManualReject
					? bp.rejection.reason
					: isAutoReject
						? `Application did not meet the role's requirements. Missing skills: ${bp.ai.unmatched.join(", ")}.`
						: undefined,
				unmatchedSkills: isAutoReject ? bp.ai.unmatched : undefined,
				occurredAt,
			});
		}

		if (bp.ai) {
			aiResults.push({
				id: `ai_${bp.id}`,
				applicationId: bp.id,
				matchPercentage: bp.ai.matchPercentage,
				matchedSkills: bp.ai.matched,
				unmatchedSkills: bp.ai.unmatched,
				summaryNote: bp.ai.summary,
				screenedAt: new Date(updatedAt + stageMs).toISOString(),
			});
		}

		if (bp.interview) {
			interviewSlots.push({
				id: `slot_${bp.id}`,
				applicationId: bp.id,
				hiringManagerId: PRIMARY_HM_ID,
				scheduledAt: bp.interview.scheduledAt,
				durationMinutes: bp.interview.durationMinutes,
				meetLink: bp.interview.meetLink,
				scoresheet: bp.interview.scoresheet,
				reviewSubmittedAt: bp.interview.reviewSubmittedAt,
				createdAt: new Date(updatedAt + stageMs * 2).toISOString(),
			});
		}
	}

	return { applications, stageUpdates, interviewSlots, aiResults };
}

function actorForStage(stage, applicantId) {
	switch (stage) {
		case PIPELINE_STAGES.APPLIED:
			return applicantId;
		case PIPELINE_STAGES.SCREENING:
			return "system";
		case PIPELINE_STAGES.INTERVIEW_SCHEDULED:
		case PIPELINE_STAGES.OFFER_SENT:
		case PIPELINE_STAGES.HIRED:
			return PRIMARY_HM_ID;
		default:
			return "system";
	}
}

function actorRoleForStage(stage) {
	switch (stage) {
		case PIPELINE_STAGES.APPLIED:
			return ACTOR_ROLES.APPLICANT;
		case PIPELINE_STAGES.SCREENING:
			return ACTOR_ROLES.SYSTEM;
		default:
			return ACTOR_ROLES.HIRING_MANAGER;
	}
}

const seeds = buildSeeds(APPLICATION_BLUEPRINTS);

export const SEED_APPLICATIONS = seeds.applications;
export const SEED_STAGE_UPDATES = seeds.stageUpdates;
export const SEED_INTERVIEW_SLOTS = seeds.interviewSlots;
export const SEED_AI_RESULTS = seeds.aiResults;
