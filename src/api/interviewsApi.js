import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const interviewsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getInterview: builder.query({
			async queryFn(applicationId) {
				try {
					const response = await apiHandler.get(
						`/applications/${applicationId}/interview`,
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: (result, error, applicationId) => [
				{ type: "Applications", id: applicationId },
				"Applications",
			],
		}),
		scheduleInterview: builder.mutation({
			async queryFn({ applicationId, ...payload }) {
				try {
					const response = await apiHandler.post(
						`/applications/${applicationId}/interview`,
						{ payload },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: (result, error, arg) => [
				{ type: "Applications", id: arg?.applicationId },
				"Applications",
			],
		}),
		rescheduleInterview: builder.mutation({
			async queryFn({ applicationId, ...payload }) {
				try {
					const response = await apiHandler.patch(
						`/applications/${applicationId}/interview`,
						{ payload },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: (result, error, arg) => [
				{ type: "Applications", id: arg?.applicationId },
				"Applications",
			],
		}),
		cancelInterview: builder.mutation({
			async queryFn({ applicationId, reason }) {
				try {
					const response = await apiHandler.delete(
						`/applications/${applicationId}/interview`,
						{ payload: reason ? { reason } : undefined },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: (result, error, arg) => [
				{ type: "Applications", id: arg?.applicationId },
				"Applications",
			],
		}),
	}),
});

export const {
	useGetInterviewQuery,
	useScheduleInterviewMutation,
	useRescheduleInterviewMutation,
	useCancelInterviewMutation,
} = interviewsApi;
