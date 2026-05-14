import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { selectAuthRole, selectAuthStatus } from "../../store/slices/authSlice";
import { ROLE_HOME_PATHS, USER_ROLES } from "../../constants/roles";
import { ROUTES } from "../../constants/routes";
import AuthLeftSide from "./AuthLeftSide";

function Auth() {
	const status = useSelector(selectAuthStatus);
	const role = useSelector(selectAuthRole);
	const location = useLocation();

	if (status === "idle" || status === "loading") {
		return null;
	}

	const normalizedPath = location.pathname.replace(/\/+$/, "") || "/";
	const isCompanySetup = normalizedPath === ROUTES.COMPANY_SETUP;
	const canStayOnCompanySetup = isCompanySetup && role === USER_ROLES.ADMIN;

	if (status === "authenticated" && role && !canStayOnCompanySetup) {
		return (
			<Navigate to={ROLE_HOME_PATHS[role] ?? ROUTES.DASHBOARD} replace />
		);
	}

	return (
		<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
			<AuthLeftSide />
			<main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6">
				<div className="w-full max-w-md">
					<div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
						<img
							src="/hireflow.png"
							alt="HireFlow"
							className="h-10 w-14 object-contain"
						/>
						<span className="text-2xl font-semibold tracking-tight">
							<span className="text-slate-950">Hire</span>
							<span className="text-[var(--color-brand-600)]">
								Flow
							</span>
						</span>
					</div>
					<Outlet />
				</div>
			</main>
		</div>
	);
}

export default Auth;
