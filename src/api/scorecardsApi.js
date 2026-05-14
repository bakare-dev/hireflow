import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const scorecardsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		listScorecardTemplates: builder.query({
			async queryFn() {
				try {
					const response = await apiHandler.get(
						"/admin/scorecard-templates",
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["ScorecardTemplates"],
		}),
		createScorecardTemplate: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post(
						"/admin/scorecard-templates",
						{ payload },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["ScorecardTemplates"],
		}),
		deleteScorecardTemplate: builder.mutation({
			async queryFn(id) {
				try {
					await apiHandler.delete(`/admin/scorecard-templates/${id}`);
					return { data: { id } };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["ScorecardTemplates"],
		}),
		// GET /api/v1/interviews/{interviewSlotId}/scorecard → list (one per HR).
		// Response may be a bare array or a `{ data: [...] }` envelope —
		// callers should normalize.
		getScorecardsForSlot: builder.query({
			async queryFn(interviewSlotId) {
				try {
					const response = await apiHandler.get(
						`/interviews/${interviewSlotId}/scorecard`,
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: (result, error, arg) => [
				{ type: "Scorecards", id: arg },
				"Scorecards",
			],
		}),
		// POST /api/v1/interviews/{interviewSlotId}/scorecard
		// HMANAGER-only. Uniqueness is (interview_slot_id, submitted_by_id) —
		// each HR may submit once. First submission flips the slot to
		// COMPLETED; subsequent submissions are still accepted.
		submitScorecard: builder.mutation({
			async queryFn({ interviewSlotId, applicationId, ...payload }) {
				try {
					const response = await apiHandler.post(
						`/interviews/${interviewSlotId}/scorecard`,
						{ payload },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: (result, error, arg) => {
				const tags = [
					"Applications",
					"Scorecards",
					{ type: "Scorecards", id: arg?.interviewSlotId },
				];
				if (arg?.applicationId) {
					tags.push({ type: "Applications", id: arg.applicationId });
				}
				return tags;
			},
		}),
	}),
});

export const {
	useListScorecardTemplatesQuery,
	useCreateScorecardTemplateMutation,
	useDeleteScorecardTemplateMutation,
	useGetScorecardsForSlotQuery,
	useSubmitScorecardMutation,
} = scorecardsApi;
