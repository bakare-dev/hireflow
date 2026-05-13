import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const applicationsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		applyToJob: builder.mutation({
			async queryFn(arg) {
				try {
					const jobId = typeof arg === "string" ? arg : arg?.jobId;
					const answers =
						typeof arg === "string" ? undefined : arg?.answers;
					const hasBody =
						Array.isArray(answers) && answers.length > 0;
					const response = await apiHandler.post(
						`/applications/jobs/${jobId}`,
						hasBody ? { payload: { answers } } : undefined,
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Applications"],
		}),
		getMyApplications: builder.query({
			async queryFn({ page = 0, size = 50 } = {}) {
				try {
					const response = await apiHandler.get("/applications", {
						params: { page, size },
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Applications"],
		}),
		getMyApplication: builder.query({
			async queryFn(id) {
				try {
					const response = await apiHandler.get(
						`/applications/${id}`,
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: (result, error, id) => [
				{ type: "Applications", id },
				"Applications",
			],
		}),
		getJobApplications: builder.query({
			async queryFn({ jobId, page = 0, size = 10 } = {}) {
				try {
					const response = await apiHandler.get(
						`/applications/jobs/${jobId}`,
						{ params: { page, size } },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: (result, error, arg) => [
				{ type: "Applications", id: `job-${arg?.jobId}` },
				"Applications",
			],
		}),
	}),
});

export const {
	useApplyToJobMutation,
	useGetMyApplicationsQuery,
	useGetMyApplicationQuery,
	useGetJobApplicationsQuery,
} = applicationsApi;
