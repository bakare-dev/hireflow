import { useMemo } from "react";
import { useSelector } from "react-redux";
import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import { selectAuthRole } from "../store/slices/authSlice";

const SHARED_NAV = [
	{ label: "Dashboard", to: ROUTES.DASHBOARD, end: true },
	{ label: "Job listings", to: ROUTES.JOB_LISTINGS },
];

const ADMIN_ONLY_NAV = [
	{ label: "Team Management", to: ROUTES.TEAM_MANAGEMENT },
	{ label: "Scorecard Templates", to: ROUTES.SCORECARD_TEMPLATES },
	{ label: "Audit Logs", to: ROUTES.AUDIT_LOGS },
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
