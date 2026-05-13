import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getMyProfile: builder.query({
			async queryFn() {
				try {
					const response = await apiHandler.get("/users/me");
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Auth"],
		}),
	}),
});

export const { useGetMyProfileQuery } = usersApi;
