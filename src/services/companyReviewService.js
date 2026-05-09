import { db } from "./db";
import { simulateLatency } from "../utils/async";
import { newId } from "../utils/id";
import { nowIso } from "../utils/date";
import { REVIEW_CATEGORIES } from "../data/companyReviews";

export async function listCompanySummaries() {
	await simulateLatency();
	return db.companies.map((company) => buildCompanySummary(company.id));
}

export async function getCompanyProfile(companyId) {
	await simulateLatency();
	return buildCompanySummary(companyId);
}

export async function listCompanyReviews(companyId, filter = {}) {
	await simulateLatency();
	let rows = db.companyReviews.filter(
		(review) => review.companyId === companyId && review.status === "APPROVED",
	);
	if (filter.anonymousOnly) {
		rows = rows.filter((review) => review.anonymous);
	}
	if (filter.stage && filter.stage !== "ALL") {
		rows = rows.filter((review) => review.interviewStageReached === filter.stage);
	}
	if (filter.query) {
		const query = filter.query.toLowerCase();
		rows = rows.filter((review) =>
			`${review.roleAppliedFor} ${review.positiveExperience} ${review.negativeExperience} ${review.adviceForCandidates}`
				.toLowerCase()
				.includes(query),
		);
	}
	if (filter.sortBy === "highest") {
		rows = [...rows].sort((a, b) => overall(b.ratings) - overall(a.ratings));
	} else if (filter.sortBy === "lowest") {
		rows = [...rows].sort((a, b) => overall(a.ratings) - overall(b.ratings));
	} else {
		rows = [...rows].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
	}
	return rows.map((review) => ({ ...review }));
}

export async function createCompanyReview(input) {
	await simulateLatency();
	const review = {
		id: newId("rev"),
		createdAt: nowIso(),
		status: "PENDING",
		...input,
	};
	db.companyReviews.push(review);
	return { ...review };
}

export async function listModerationQueue() {
	await simulateLatency();
	return db.companyReviews
		.filter((review) => review.status !== "APPROVED")
		.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
		.map((review) => ({ ...review }));
}

export async function moderateReview({ reviewId, status }) {
	await simulateLatency();
	const index = db.companyReviews.findIndex((review) => review.id === reviewId);
	if (index === -1) throw new Error("Review not found");
	db.companyReviews[index] = { ...db.companyReviews[index], status };
	return { ...db.companyReviews[index] };
}

function buildCompanySummary(companyId) {
	const company = db.companies.find((row) => row.id === companyId);
	if (!company) throw new Error("Company not found");
	const reviews = db.companyReviews.filter(
		(review) => review.companyId === companyId && review.status === "APPROVED",
	);
	const categoryAverages = {};
	for (const category of REVIEW_CATEGORIES) {
		const scores = reviews
			.map((review) => review.ratings?.[category] ?? null)
			.filter((score) => score !== null);
		categoryAverages[category] = scores.length
			? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
			: 0;
	}
	const overallScore = reviews.length
		? Number(
				(
					Object.values(categoryAverages).reduce((sum, score) => sum + score, 0) /
					REVIEW_CATEGORIES.length
				).toFixed(1),
			)
		: 0;
	const recommendationPercentage = reviews.length
		? Math.round(
				(reviews.filter((review) => review.recommendation === "WOULD_APPLY_AGAIN").length /
					reviews.length) *
					100,
			)
		: 0;
	return {
		company: { ...company },
		overallScore,
		totalReviews: reviews.length,
		recommendationPercentage,
		categoryAverages,
	};
}

function overall(ratings) {
	const values = Object.values(ratings ?? {});
	if (!values.length) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}
