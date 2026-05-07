import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";

const NAV_ITEMS = [
	{ label: "Dashboard", to: ROUTES.HM_HOME, end: true },
	{ label: "Job listings", to: ROUTES.HM_JOBS },
	{ label: "Interviews", to: ROUTES.HM_INTERVIEWS },
];

function HiringManagerLayout() {
	return (
		<AppLayout
			brand="HireFlow · Hiring"
			navItems={NAV_ITEMS}
			title="Hiring Manager"
		/>
	);
}

export default HiringManagerLayout;
