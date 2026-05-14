import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import AppLayout from "./AppLayout";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import { selectAuthRole, selectAuthStatus } from "../store/slices/authSlice";
import { useGetMyCompanyQuery } from "../api/companiesApi";

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
	const status = useSelector(selectAuthStatus);
	const role = useSelector(selectAuthRole);
	const isAdmin = role === USER_ROLES.ADMIN;

	const {
		data: company,
		isLoading: companyLoading,
		isError: companyError,
	} = useGetMyCompanyQuery(undefined, {
		skip: status !== "authenticated" || !isAdmin,
	});

	const navItems = useMemo(() => {
		if (isAdmin) return [...SHARED_NAV, ...ADMIN_ONLY_NAV];
		return SHARED_NAV;
	}, [isAdmin]);

	if (isAdmin && !companyLoading && (companyError || !company)) {
		return <Navigate to={ROUTES.COMPANY_SETUP} replace />;
	}

	return (
		<AppLayout
			navItems={navItems}
			title={isAdmin ? "Admin" : "Hiring Manager"}
		/>
	);
}

export default RecruitmentLayout;
