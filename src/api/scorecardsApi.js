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
		getScorecardTemplate: builder.query({
			async queryFn(id) {
				try {
					const response = await apiHandler.get(
						`/admin/scorecard-templates/${id}`,
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: (result, error, id) => [
				{ type: "ScorecardTemplates", id },
				"ScorecardTemplates",
			],
		}),
		updateScorecardTemplate: builder.mutation({
			async queryFn({ id, ...payload }) {
				try {
					const response = await apiHandler.put(
						`/admin/scorecard-templates/${id}`,
						{ payload },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: (result, error, arg) => [
				"ScorecardTemplates",
				{ type: "ScorecardTemplates", id: arg?.id },
			],
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
	useGetScorecardTemplateQuery,
	useCreateScorecardTemplateMutation,
	useUpdateScorecardTemplateMutation,
	useDeleteScorecardTemplateMutation,
	useGetScorecardsForSlotQuery,
	useSubmitScorecardMutation,
} = scorecardsApi;
