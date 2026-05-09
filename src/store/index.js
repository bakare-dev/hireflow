import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import jobsReducer from './slices/jobsSlice'
import applicationsReducer from './slices/applicationsSlice'
import interviewsReducer from './slices/interviewsSlice'
import notificationsReducer from './slices/notificationsSlice'
import companyReviewsReducer from './slices/companyReviewsSlice'
import { baseApi } from '../api/baseApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    interviews: interviewsReducer,
    notifications: notificationsReducer,
    companyReviews: companyReviewsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
