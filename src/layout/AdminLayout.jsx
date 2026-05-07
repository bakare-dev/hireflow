import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";

const NAV_ITEMS = [
	{ label: "Dashboard", to: ROUTES.ADMIN_HOME, end: true },
	{ label: "Job listings", to: ROUTES.ADMIN_JOBS },
	{ label: "Pipeline funnel", to: ROUTES.ADMIN_FUNNEL },
	{ label: "Time-to-hire", to: ROUTES.ADMIN_TIME_TO_HIRE },
	{ label: "Audit log", to: ROUTES.ADMIN_AUDIT },
	{ label: "Settings", to: ROUTES.ADMIN_SETTINGS },
];

function AdminLayout() {
	return (
		<AppLayout
			brand="HireFlow · Admin"
			navItems={NAV_ITEMS}
			title="Admin"
		/>
	);
}

export default AdminLayout;
