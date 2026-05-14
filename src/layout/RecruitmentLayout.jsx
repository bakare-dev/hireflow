import { useMemo } from "react";
import { useSelector } from "react-redux";
import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import { selectAuthRole } from "../store/slices/authSlice";

const SHARED_NAV = [
	{ label: "Dashboard", to: ROUTES.DASHBOARD, end: true },
	{ label: "Job listings", to: ROUTES.JOB_LISTINGS },
	// { label: "Candidates", to: ROUTES.CANDIDATES },
	// { label: "Interviews", to: ROUTES.INTERVIEWS },
	// { label: "Offers", to: ROUTES.OFFERS },
	// { label: "AI Screening", to: ROUTES.AI_SCREENING },
	// { label: "Analytics", to: ROUTES.ANALYTICS },
	// { label: "Messages", to: ROUTES.MESSAGES },
	// { label: "Notifications", to: ROUTES.NOTIFICATIONS },
];

const ADMIN_ONLY_NAV = [
	{ label: "Team Management", to: ROUTES.TEAM_MANAGEMENT },
	{ label: "Scorecard Templates", to: ROUTES.SCORECARD_TEMPLATES },
	// { label: "Review Moderation", to: ROUTES.REVIEW_MODERATION },
	// { label: "Audit Logs", to: ROUTES.AUDIT_LOGS },
	// { label: "Organization Settings", to: ROUTES.ORGANIZATION_SETTINGS },
];

function RecruitmentLayout() {
	const role = useSelector(selectAuthRole);
	const navItems = useMemo(() => {
		if (role === USER_ROLES.ADMIN) {
			return [...SHARED_NAV, ...ADMIN_ONLY_NAV];
		}
		return SHARED_NAV;
	}, [role]);

	return (
		<AppLayout
			navItems={navItems}
			title={role === USER_ROLES.ADMIN ? "Admin" : "Hiring Manager"}
		/>
	);
}

export default RecruitmentLayout;
