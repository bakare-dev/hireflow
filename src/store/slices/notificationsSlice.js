import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "../../services";

export const fetchNotifications = createAsyncThunk(
	"notifications/fetchForUser",
	async (userId) => notificationService.listNotificationsForUser(userId),
);

const notificationsSlice = createSlice({
	name: "notifications",
	initialState: {
		items: [],
		status: "idle",
	},
	reducers: {
		pushNotification(state, action) {
			state.items.unshift(action.payload);
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNotifications.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchNotifications.fulfilled, (state, action) => {
				state.items = action.payload;
				state.status = "ready";
			});
	},
});

export const { pushNotification } = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications.items;

export default notificationsSlice.reducer;
