import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const applicationsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		applyToJob: builder.mutation({
			async queryFn(jobId) {
				try {
					const response = await apiHandler.post(
						`/applications/jobs/${jobId}`,
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
					const response = await apiHandler.get(`/applications/${id}`);
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
	}),
});

export const {
	useApplyToJobMutation,
	useGetMyApplicationsQuery,
	useGetMyApplicationQuery,
} = applicationsApi;
