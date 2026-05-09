import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes";
import { restoreSession } from "./store/slices/authSlice";
import { fetchJobs } from "./store/slices/jobsSlice";
import { fetchApplications } from "./store/slices/applicationsSlice";
import { fetchInterviewSlots } from "./store/slices/interviewsSlice";

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
			<ToastContainer
				position="top-right"
				autoClose={4000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>
		</>
	);
}

export default App;
