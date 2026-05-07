import { Route, Routes } from "react-router";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";

import PublicLayout from "../layout/PublicLayout";
import ApplicantLayout from "../layout/ApplicantLayout";
import HiringManagerLayout from "../layout/HiringManagerLayout";
import AdminLayout from "../layout/AdminLayout";
import RoleGuard from "./RoleGuard";

import Landing from "../pages/shared/Landing";
import NotFound from "../pages/shared/NotFound";
import Forbidden from "../pages/shared/Forbidden";
import ComingSoon from "../pages/shared/ComingSoon";
import RoleSwitch from "../pages/auth/RoleSwitch";
import Auth from "../pages/auth/Auth";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import PasswordReset from "../pages/auth/PasswordReset";

function AppRoutes() {
	return (
		<Routes>
			<Route element={<PublicLayout />}>
				<Route index element={<Landing />} />
				<Route path={ROUTES.DEV_ROLE_SWITCH} element={<RoleSwitch />} />
				<Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
			</Route>

			<Route element={<Auth />}>
				<Route path={ROUTES.SIGN_IN} element={<SignIn />} />
				<Route path={ROUTES.SIGN_UP} element={<SignUp />} />
				<Route
					path={ROUTES.PASSWORD_RESET}
					element={<PasswordReset />}
				/>
			</Route>

			<Route
				element={
					<RoleGuard allow={USER_ROLES.APPLICANT}>
						<ApplicantLayout />
					</RoleGuard>
				}
			>
				<Route
					path={ROUTES.JOBS}
					element={<ComingSoon title="Browse jobs (A1)" />}
				/>
				<Route
					path={ROUTES.JOB_DETAIL()}
					element={<ComingSoon title="Job detail (A2)" />}
				/>
				<Route
					path={ROUTES.ME}
					element={<ComingSoon title="My applications (A3)" />}
				/>
				<Route
					path={ROUTES.MY_APPLICATION()}
					element={<ComingSoon title="Application detail (A4)" />}
				/>
				<Route
					path={ROUTES.MY_PROFILE}
					element={<ComingSoon title="Profile (A5)" />}
				/>
				<Route
					path={ROUTES.MY_INBOX}
					element={<ComingSoon title="Inbox (A6)" />}
				/>
			</Route>

			<Route
				element={
					<RoleGuard allow={USER_ROLES.HIRING_MANAGER}>
						<HiringManagerLayout />
					</RoleGuard>
				}
			>
				<Route
					path={ROUTES.HM_HOME}
					element={<ComingSoon title="HM dashboard (H1)" />}
				/>
				<Route
					path={ROUTES.HM_JOBS}
					element={<ComingSoon title="My job listings (H2)" />}
				/>
				<Route
					path={ROUTES.HM_JOB_NEW}
					element={<ComingSoon title="Create job (H3)" />}
				/>
				<Route
					path={ROUTES.HM_JOB_EDIT()}
					element={<ComingSoon title="Edit job (H3)" />}
				/>
				<Route
					path={ROUTES.HM_SCREENING()}
					element={<ComingSoon title="Screening queue (H4)" />}
				/>
				<Route
					path={ROUTES.HM_APPLICATION()}
					element={<ComingSoon title="Applicant detail (H5)" />}
				/>
				<Route
					path={ROUTES.HM_SCHEDULE()}
					element={<ComingSoon title="Schedule interview (H6)" />}
				/>
				<Route
					path={ROUTES.HM_INTERVIEWS}
					element={<ComingSoon title="Interviews (H7)" />}
				/>
				<Route
					path={ROUTES.HM_SCORESHEET()}
					element={<ComingSoon title="Scoresheet (H8)" />}
				/>
				<Route
					path={ROUTES.HM_OFFER()}
					element={<ComingSoon title="Send offer (H9)" />}
				/>
			</Route>

			<Route
				element={
					<RoleGuard allow={USER_ROLES.ADMIN}>
						<AdminLayout />
					</RoleGuard>
				}
			>
				<Route
					path={ROUTES.ADMIN_HOME}
					element={<ComingSoon title="Admin dashboard (AD1)" />}
				/>
				<Route
					path={ROUTES.ADMIN_JOBS}
					element={<ComingSoon title="All job listings (AD2)" />}
				/>
				<Route
					path={ROUTES.ADMIN_FUNNEL}
					element={<ComingSoon title="Pipeline funnel (AD3)" />}
				/>
				<Route
					path={ROUTES.ADMIN_TIME_TO_HIRE}
					element={<ComingSoon title="Time-to-hire (AD4)" />}
				/>
				<Route
					path={ROUTES.ADMIN_AUDIT}
					element={<ComingSoon title="Audit log (AD5)" />}
				/>
				<Route
					path={ROUTES.ADMIN_SETTINGS}
					element={<ComingSoon title="Settings (AD6)" />}
				/>
			</Route>

			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default AppRoutes;
