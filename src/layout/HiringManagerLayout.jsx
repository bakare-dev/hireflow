import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";

const NAV_ITEMS = [
	{ label: "Dashboard", to: ROUTES.DASHBOARD, end: true },
	{ label: "Job listings", to: ROUTES.JOB_LISTINGS },
	{ label: "Candidates", to: ROUTES.CANDIDATES },
	{ label: "Interviews", to: ROUTES.INTERVIEWS },
	{ label: "Offers", to: ROUTES.OFFERS },
	{ label: "AI Screening", to: ROUTES.AI_SCREENING },
	{ label: "Analytics", to: ROUTES.ANALYTICS },
	{ label: "Messages", to: ROUTES.MESSAGES },
	{ label: "Notifications", to: ROUTES.NOTIFICATIONS },
];

function HiringManagerLayout() {
	return <AppLayout navItems={NAV_ITEMS} title="Hiring Manager" />;
}

export default HiringManagerLayout;
