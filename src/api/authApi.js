import { apiHandler, setAuthToken } from "../services/api";
import { toAuthUser, toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation({
			async queryFn(payload) {
				try {
					const auth = await apiHandler.post("/auth/login", {
						auth: false,
						payload,
					});
					setAuthToken(auth.token);
					return { data: toAuthUser(auth) };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Auth"],
		}),
		register: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post("/auth/register", {
						auth: false,
						payload,
						returnEnvelope: true,
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Auth"],
		}),
		verifyOtp: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post("/auth/verify-otp", {
						auth: false,
						payload,
						returnEnvelope: true,
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Auth"],
		}),
	}),
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useVerifyOtpMutation,
} = authApi;
