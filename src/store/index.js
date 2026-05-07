import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import jobsReducer from './slices/jobsSlice'
import applicationsReducer from './slices/applicationsSlice'
import interviewsReducer from './slices/interviewsSlice'
import notificationsReducer from './slices/notificationsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    interviews: interviewsReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
})
