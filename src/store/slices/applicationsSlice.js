import {
	createSlice,
	createAsyncThunk,
	createSelector,
} from "@reduxjs/toolkit";
import { applicationService } from "../../services";

export const fetchApplications = createAsyncThunk(
	"applications/fetchAll",
	async (filter) => applicationService.listApplications(filter),
);

export const fetchStageUpdates = createAsyncThunk(
	"applications/fetchStageUpdates",
	async (applicationId) => ({
		applicationId,
		updates: await applicationService.listStageUpdates(applicationId),
	}),
);

export const applyToJob = createAsyncThunk(
	"applications/apply",
	async (input, { rejectWithValue }) => {
		try {
			return await applicationService.applyToJob(input);
		} catch (err) {
			return rejectWithValue({ message: err.message, code: err.code });
		}
	},
);

export const transitionStage = createAsyncThunk(
	"applications/transitionStage",
	async (input) => applicationService.transitionStage(input),
);

const applicationsSlice = createSlice({
	name: "applications",
	initialState: {
		items: [],
		stageUpdatesByApplicationId: {},
		status: "idle",
		error: null,
	},
	reducers: {
		upsertApplication(state, action) {
			const a = action.payload;
			const idx = state.items.findIndex((x) => x.id === a.id);
			if (idx === -1) state.items.push(a);
			else state.items[idx] = a;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchApplications.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchApplications.fulfilled, (state, action) => {
				state.items = action.payload;
				state.status = "ready";
			})
			.addCase(fetchApplications.rejected, (state, action) => {
				state.status = "error";
				state.error =
					action.error?.message ?? "Failed to load applications";
			})
			.addCase(fetchStageUpdates.fulfilled, (state, action) => {
				state.stageUpdatesByApplicationId[
					action.payload.applicationId
				] = action.payload.updates;
			})
			.addCase(applyToJob.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(transitionStage.fulfilled, (state, action) => {
				const idx = state.items.findIndex(
					(x) => x.id === action.payload.id,
				);
				if (idx >= 0) state.items[idx] = action.payload;
			});
	},
});

export const { upsertApplication } = applicationsSlice.actions;

export const selectApplications = (state) => state.applications.items;

export const selectApplicationById = (id) => (state) =>
	state.applications.items.find((a) => a.id === id) ?? null;

export const selectApplicationsByApplicant = (applicantId) =>
	createSelector(selectApplications, (apps) =>
		apps.filter((a) => a.applicantId === applicantId),
	);

export const selectApplicationsByJob = (jobListingId) =>
	createSelector(selectApplications, (apps) =>
		apps.filter((a) => a.jobListingId === jobListingId),
	);

export const selectStageUpdatesFor = (applicationId) => (state) =>
	state.applications.stageUpdatesByApplicationId[applicationId] ?? [];

export default applicationsSlice.reducer;
