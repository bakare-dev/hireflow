import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { companyReviewService } from "../../services";

export const fetchCompanySummaries = createAsyncThunk(
	"companyReviews/fetchSummaries",
	async () => companyReviewService.listCompanySummaries(),
);

export const fetchCompanyProfile = createAsyncThunk(
	"companyReviews/fetchProfile",
	async (companyId) => ({
		companyId,
		profile: await companyReviewService.getCompanyProfile(companyId),
	}),
);

export const fetchCompanyReviews = createAsyncThunk(
	"companyReviews/fetchReviews",
	async ({ companyId, filter }) => ({
		companyId,
		reviews: await companyReviewService.listCompanyReviews(companyId, filter),
	}),
);

export const submitCompanyReview = createAsyncThunk(
	"companyReviews/submit",
	async (input) => companyReviewService.createCompanyReview(input),
);

export const fetchModerationQueue = createAsyncThunk(
	"companyReviews/fetchModerationQueue",
	async () => companyReviewService.listModerationQueue(),
);

export const applyReviewModeration = createAsyncThunk(
	"companyReviews/applyModeration",
	async ({ reviewId, status }) =>
		companyReviewService.moderateReview({ reviewId, status }),
);

const companyReviewsSlice = createSlice({
	name: "companyReviews",
	initialState: {
		summaries: [],
		profilesByCompanyId: {},
		reviewsByCompanyId: {},
		moderationQueue: [],
		status: "idle",
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCompanySummaries.fulfilled, (state, action) => {
				state.summaries = action.payload;
				state.status = "ready";
			})
			.addCase(fetchCompanyProfile.fulfilled, (state, action) => {
				state.profilesByCompanyId[action.payload.companyId] =
					action.payload.profile;
			})
			.addCase(fetchCompanyReviews.fulfilled, (state, action) => {
				state.reviewsByCompanyId[action.payload.companyId] =
					action.payload.reviews;
			})
			.addCase(submitCompanyReview.fulfilled, (state, action) => {
				const companyId = action.payload.companyId;
				const current = state.reviewsByCompanyId[companyId] ?? [];
				state.reviewsByCompanyId[companyId] = [action.payload, ...current];
			})
			.addCase(fetchModerationQueue.fulfilled, (state, action) => {
				state.moderationQueue = action.payload;
			})
			.addCase(applyReviewModeration.fulfilled, (state, action) => {
				state.moderationQueue = state.moderationQueue.filter(
					(review) => review.id !== action.payload.id,
				);
			});
	},
});

export const selectCompanySummaries = (state) => state.companyReviews.summaries;
export const selectCompanyProfile = (companyId) => (state) =>
	state.companyReviews.profilesByCompanyId[companyId] ?? null;
export const selectCompanyReviews = (companyId) => (state) =>
	state.companyReviews.reviewsByCompanyId[companyId] ?? [];
export const selectModerationQueue = (state) => state.companyReviews.moderationQueue;

export default companyReviewsSlice.reducer;
