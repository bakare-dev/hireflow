import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { interviewService } from '../../services'

export const fetchInterviewSlots = createAsyncThunk(
  'interviews/fetchAll',
  async (filter) => interviewService.listInterviewSlots(filter),
)

export const createInterviewSlot = createAsyncThunk(
  'interviews/create',
  async (input) => interviewService.createInterviewSlot(input),
)

export const submitScoresheet = createAsyncThunk(
  'interviews/submitScoresheet',
  async ({ slotId, scoresheet }) =>
    interviewService.submitScoresheet(slotId, scoresheet),
)

const interviewsSlice = createSlice({
  name: 'interviews',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    upsertSlot(state, action) {
      const idx = state.items.findIndex((s) => s.id === action.payload.id)
      if (idx === -1) state.items.push(action.payload)
      else state.items[idx] = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviewSlots.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInterviewSlots.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'ready'
      })
      .addCase(createInterviewSlot.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(submitScoresheet.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id)
        if (idx >= 0) state.items[idx] = action.payload
      })
  },
})

export const { upsertSlot } = interviewsSlice.actions

export const selectInterviewSlots = (state) => state.interviews.items

export const selectSlotByApplication = (applicationId) =>
  createSelector(selectInterviewSlots, (slots) =>
    slots.find((s) => s.applicationId === applicationId) ?? null,
  )

export const selectSlotById = (id) => (state) =>
  state.interviews.items.find((s) => s.id === id) ?? null

export default interviewsSlice.reducer
