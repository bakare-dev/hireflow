import { useDispatch } from "react-redux";
import { showToast } from "../store/slices/uiSlice";

function useToast() {
	const dispatch = useDispatch();

	return {
		info(message, durationMs = 4000) {
			dispatch(showToast({ message, tone: "info", durationMs }));
		},
		success(message, durationMs = 4000) {
			dispatch(showToast({ message, tone: "success", durationMs }));
		},
		error(message, durationMs = 4000) {
			dispatch(showToast({ message, tone: "error", durationMs }));
		},
	};
}

export default useToast;
