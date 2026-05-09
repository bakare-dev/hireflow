import { toast } from "react-toastify";

function useToast() {
	return {
		info(message, durationMs = 4000) {
			toast.info(message, { autoClose: durationMs });
		},
		success(message, durationMs = 4000) {
			toast.success(message, { autoClose: durationMs });
		},
		error(message, durationMs = 4000) {
			toast.error(message, { autoClose: durationMs });
		},
	};
}

export default useToast;
