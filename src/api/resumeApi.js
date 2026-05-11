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
					if (err?.status === 404) return { data: null };
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
		getUploadSignature: builder.mutation({
			async queryFn() {
				try {
					const response = await apiHandler.get(
						"/uploads/pdf-signature",
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
		}),
		updateResumePdfUrl: builder.mutation({
			async queryFn(pdfUrl) {
				try {
					const response = await apiHandler.patch(
						"/resume-profiles/pdf-url",
						{ payload: { pdfUrl } },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["ResumeProfile"],
		}),
	}),
});

export const {
	useGetResumeProfileQuery,
	useUpsertResumeProfileMutation,
	useGetUploadSignatureMutation,
	useUpdateResumePdfUrlMutation,
} = resumeApi;
