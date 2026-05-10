import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const jobsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getOpenJobs: builder.query({
			async queryFn({ page = 0, size = 10, title, type } = {}) {
				try {
					const response = await apiHandler.get("/jobs", {
						params: { page, size, title, type },
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Jobs"],
		}),
		createJob: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post("/jobs", {
						payload,
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Jobs"],
		}),
		updateJob: builder.mutation({
			async queryFn({ id, patch }) {
				try {
					const response = await apiHandler.put(`/jobs/${id}`, {
						payload: patch,
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Jobs"],
		}),
		getJob: builder.query({
			async queryFn(id) {
				try {
					const response = await apiHandler.get(`/jobs/${id}`);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Jobs"],
		}),
		getJobsByCompany: builder.query({
			async queryFn({ companyId, status, page = 0, size = 10 }) {
				try {
					const response = await apiHandler.get(
						`/jobs/company/${companyId}`,
						{
							params: { status, page, size },
						},
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Jobs"],
		}),
		getCompanyJobs: builder.query({
			async queryFn({ status, page = 0, size = 10 } = {}) {
				try {
					const response = await apiHandler.get("/jobs/company", {
						params: { status, page, size },
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Jobs"],
		}),
		searchSkills: builder.query({
			async queryFn(query) {
				try {
					const response = await apiHandler.get("/skills/search", {
						params: { query },
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Jobs"],
		}),
		createSkill: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post("/skills", {
						payload,
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Jobs"],
		}),
	}),
});

export const {
	useGetOpenJobsQuery,
	useCreateJobMutation,
	useUpdateJobMutation,
	useGetJobQuery,
	useGetJobsByCompanyQuery,
	useGetCompanyJobsQuery,
	useSearchSkillsQuery,
	useCreateSkillMutation,
} = jobsApi;
