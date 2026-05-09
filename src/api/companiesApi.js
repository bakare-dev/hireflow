import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const companiesApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		createCompany: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post("/companies", { payload });
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Companies"],
		}),
		getMyCompany: builder.query({
			async queryFn() {
				try {
					const response = await apiHandler.get("/companies/me");
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Companies"],
		}),
	}),
});

export const { useCreateCompanyMutation, useGetMyCompanyQuery } = companiesApi;
