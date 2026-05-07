import {
	createSlice,
	createAsyncThunk,
	createSelector,
} from "@reduxjs/toolkit";
import { jobService } from "../../services";
import { JOB_LISTING_STATUS } from "../../constants/jobStatus";

export const fetchJobs = createAsyncThunk("jobs/fetchAll", async () => {
	return jobService.listJobs();
});

export const createJob = createAsyncThunk("jobs/create", async (input) => {
	return jobService.createJob(input);
});

export const updateJob = createAsyncThunk(
	"jobs/update",
	async ({ id, patch }) => jobService.updateJob(id, patch),
);

export const transitionJobStatus = createAsyncThunk(
	"jobs/transitionStatus",
	async ({ id, nextStatus }) =>
		jobService.transitionJobStatus(id, nextStatus),
);

const jobsSlice = createSlice({
	name: "jobs",
	initialState: {
		items: [],
		status: "idle",
		error: null,
	},
	reducers: {
		upsertJob(state, action) {
			const job = action.payload;
			const idx = state.items.findIndex((j) => j.id === job.id);
			if (idx === -1) state.items.push(job);
			else state.items[idx] = job;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchJobs.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchJobs.fulfilled, (state, action) => {
				state.items = action.payload;
				state.status = "ready";
			})
			.addCase(fetchJobs.rejected, (state, action) => {
				state.status = "error";
				state.error = action.error?.message ?? "Failed to load jobs";
			})
			.addCase(createJob.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(updateJob.fulfilled, (state, action) => {
				const idx = state.items.findIndex(
					(j) => j.id === action.payload.id,
				);
				if (idx >= 0) state.items[idx] = action.payload;
			})
			.addCase(transitionJobStatus.fulfilled, (state, action) => {
				const idx = state.items.findIndex(
					(j) => j.id === action.payload.id,
				);
				if (idx >= 0) state.items[idx] = action.payload;
			});
	},
});

export const { upsertJob } = jobsSlice.actions;

export const selectJobs = (state) => state.jobs.items;
export const selectJobsStatus = (state) => state.jobs.status;

export const selectOpenJobs = createSelector(selectJobs, (jobs) =>
	jobs.filter((j) => j.status === JOB_LISTING_STATUS.OPEN),
);

export const selectJobById = (id) => (state) =>
	state.jobs.items.find((j) => j.id === id) ?? null;

export const selectJobsByHiringManager = (hiringManagerId) =>
	createSelector(selectJobs, (jobs) =>
		jobs.filter((j) => j.hiringManagerId === hiringManagerId),
	);

export default jobsSlice.reducer;
