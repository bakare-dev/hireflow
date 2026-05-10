import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const resumeApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getResumeProfile: builder.query({
			async queryFn() {
				try {
					const response = await apiHandler.get("/resume-profiles");
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["ResumeProfile"],
		}),
		upsertResumeProfile: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.put("/resume-profiles", {
						payload,
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["ResumeProfile"],
		}),
	}),
});

export const { useGetResumeProfileQuery, useUpsertResumeProfileMutation } =
	resumeApi;
