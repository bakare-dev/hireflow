import { createSlice } from "@reduxjs/toolkit";
import { newId } from "../../utils/id";

const uiSlice = createSlice({
	name: "ui",
	initialState: {
		toasts: [],
	},
	reducers: {
		showToast: {
			reducer(state, action) {
				state.toasts.push(action.payload);
			},
			prepare({ message, tone = "info", durationMs = 4000 }) {
				return {
					payload: {
						id: newId("toast"),
						message,
						tone,
						durationMs,
					},
				};
			},
		},
		dismissToast(state, action) {
			state.toasts = state.toasts.filter((t) => t.id !== action.payload);
		},
	},
});

export const { showToast, dismissToast } = uiSlice.actions;

export const selectToasts = (state) => state.ui.toasts;

export default uiSlice.reducer;
