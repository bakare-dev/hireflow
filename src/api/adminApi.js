import { apiHandler } from "../services/api";
import { toRtkError } from "../utils/api";
import { baseApi } from "./baseApi";

export const adminApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		inviteManager: builder.mutation({
			async queryFn(payload) {
				try {
					const response = await apiHandler.post(
						"/admin/invite-manager",
						{ payload, returnEnvelope: true },
					);
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Staff"],
		}),
		listStaff: builder.query({
			async queryFn({ page = 0, size = 10 } = {}) {
				try {
					const response = await apiHandler.get("/admin/staff", {
						params: { page, size },
					});
					return { data: response };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			providesTags: ["Staff"],
		}),
		deleteStaff: builder.mutation({
			async queryFn(staffId) {
				try {
					await apiHandler.delete(`/admin/staff/${staffId}`);
					return { data: { id: staffId } };
				} catch (err) {
					return { error: toRtkError(err) };
				}
			},
			invalidatesTags: ["Staff"],
		}),
	}),
});

export const {
	useInviteManagerMutation,
	useListStaffQuery,
	useDeleteStaffMutation,
} = adminApi;
