import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";

const NAV_ITEMS = [
	{ label: "Browse jobs", to: ROUTES.JOBS, end: true },
	{ label: "My applications", to: ROUTES.ME, end: true },
	{ label: "Inbox", to: ROUTES.MY_INBOX },
	{ label: "Profile", to: ROUTES.MY_PROFILE },
];

function ApplicantLayout() {
	return (
		<AppLayout
			brand="HireFlow · Applicant"
			navItems={NAV_ITEMS}
			title="Applicant"
		/>
	);
}

export default ApplicantLayout;
