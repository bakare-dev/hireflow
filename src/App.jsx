import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRoutes from "./routes";
import { restoreSession } from "./store/slices/authSlice";
import { fetchJobs } from "./store/slices/jobsSlice";
import { fetchApplications } from "./store/slices/applicationsSlice";
import { fetchInterviewSlots } from "./store/slices/interviewsSlice";
import ToastViewport from "./components/common/ToastViewport";

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(restoreSession());
		dispatch(fetchJobs());
		dispatch(fetchApplications());
		dispatch(fetchInterviewSlots());
	}, [dispatch]);

	return (
		<>
			<AppRoutes />
			<ToastViewport />
		</>
	);
}

export default App;
