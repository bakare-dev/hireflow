export const REVIEW_CATEGORIES = Object.freeze([
	"Culture",
	"Professionalism",
	"Communication",
	"Interview Experience",
	"Salary Transparency",
	"Work-Life Balance",
	"Hiring Speed",
	"Candidate Respect",
]);

export const SEED_COMPANY_REVIEWS = [
	{
		id: "rev_1",
		companyId: "co_acme",
		authorUserId: "user_applicant_2",
		anonymous: true,
		roleAppliedFor: "Backend Engineer (Python)",
		interviewStageReached: "INTERVIEW_SCHEDULED",
		recommendation: "WOULD_APPLY_AGAIN",
		ratings: {
			Culture: 8,
			Professionalism: 7,
			Communication: 6,
			"Interview Experience": 7,
			"Salary Transparency": 5,
			"Work-Life Balance": 8,
			"Hiring Speed": 6,
			"Candidate Respect": 8,
		},
		positiveExperience:
			"Interviewers were well-prepared and the problem discussion was collaborative.",
		negativeExperience:
			"Feedback timing after final interview could have been faster.",
		adviceForCandidates:
			"Prepare practical API design examples and talk through trade-offs clearly.",
		createdAt: "2026-05-01T10:00:00.000Z",
		status: "APPROVED",
	},
	{
		id: "rev_2",
		companyId: "co_acme",
		authorUserId: "user_applicant_4",
		anonymous: false,
		roleAppliedFor: "Senior Frontend Engineer",
		interviewStageReached: "SCREENING",
		recommendation: "NEUTRAL",
		ratings: {
			Culture: 7,
			Professionalism: 8,
			Communication: 7,
			"Interview Experience": 6,
			"Salary Transparency": 6,
			"Work-Life Balance": 7,
			"Hiring Speed": 5,
			"Candidate Respect": 8,
		},
		positiveExperience:
			"Recruiter communication was clear about next steps.",
		negativeExperience:
			"Pipeline moved slowly between screening milestones.",
		adviceForCandidates:
			"Clarify timeline expectations during your first recruiter call.",
		createdAt: "2026-04-20T14:30:00.000Z",
		status: "APPROVED",
	},
	{
		id: "rev_3",
		companyId: "co_acme",
		authorUserId: "user_applicant_5",
		anonymous: true,
		roleAppliedFor: "Product Designer",
		interviewStageReached: "REJECTED",
		recommendation: "WOULD_NOT_RECOMMEND",
		ratings: {
			Culture: 8,
			Professionalism: 6,
			Communication: 5,
			"Interview Experience": 6,
			"Salary Transparency": 5,
			"Work-Life Balance": 8,
			"Hiring Speed": 4,
			"Candidate Respect": 7,
		},
		positiveExperience:
			"Interview panel gave realistic product scenarios.",
		negativeExperience:
			"Long gap before final decision and limited detailed feedback.",
		adviceForCandidates:
			"Keep a documented portfolio walkthrough with clear impact metrics.",
		createdAt: "2026-04-08T09:15:00.000Z",
		status: "APPROVED",
	},
];
