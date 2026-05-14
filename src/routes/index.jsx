import { Navigate, Route, Routes } from "react-router";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";
import useSyncMyProfile from "../hooks/useSyncMyProfile";
import useApplicationStream from "../hooks/useApplicationStream";

import PublicLayout from "../layout/PublicLayout";
import ApplicantLayout from "../layout/ApplicantLayout";
import RecruitmentLayout from "../layout/RecruitmentLayout";
import RoleGuard from "./RoleGuard";

import NotFound from "../pages/shared/NotFound";
import Landing from "../pages/shared/Landing";
import Auth from "../pages/auth/Auth";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import AcceptInvite from "../pages/auth/AcceptInvite";
import CompanySetup from "../pages/auth/CompanySetup";
import JobDiscovery from "../pages/applicant/JobDiscovery";
import JobDetail from "../pages/applicant/JobDetail";
import MyApplications from "../pages/applicant/MyApplications";
import ApplicationDetail from "../pages/applicant/ApplicationDetail";
import Interviews from "../pages/applicant/Interviews";
import Profile from "../pages/applicant/Profile";
import DashboardPage from "../pages/recruitment/DashboardPage";
import JobListingsPage from "../pages/recruitment/JobListingsPage";
import JobDetailDashboardPage from "../pages/recruitment/JobDetailDashboardPage";
import JobListingFormPage from "../pages/recruitment/JobListingFormPage";
import JobApplicationsPage from "../pages/recruitment/JobApplicationsPage";
import JobApplicationDetailPage from "../pages/recruitment/JobApplicationDetailPage";
import TeamManagementPage from "../pages/recruitment/TeamManagementPage";
import ScorecardTemplatesPage from "../pages/recruitment/ScorecardTemplatesPage";
import AuditLogsPage from "../pages/recruitment/AuditLogsPage";

function AppRoutes() {
	useSyncMyProfile();
	useApplicationStream();

	return (
		<Routes>
			<Route element={<PublicLayout />}>
				<Route index element={<Landing />} />
			</Route>

			<Route element={<Auth />}>
				<Route path={ROUTES.SIGN_IN} element={<SignIn />} />
				<Route path={ROUTES.SIGN_UP} element={<SignUp />} />
				<Route path={ROUTES.ACCEPT_INVITE} element={<AcceptInvite />} />
				<Route
					path={ROUTES.COMPANY_SETUP}
					element={
						<RoleGuard allow={USER_ROLES.ADMIN}>
							<CompanySetup />
						</RoleGuard>
					}
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
					path={ROUTES.APPLICANT_JOBS}
					element={<JobDiscovery />}
				/>
				<Route
					path={ROUTES.APPLICANT_JOB_DETAIL()}
					element={<JobDetail />}
				/>
				<Route
					path={ROUTES.APPLICANT_APPLICATIONS}
					element={<MyApplications />}
				/>
				<Route
					path={ROUTES.APPLICANT_APPLICATION()}
					element={<ApplicationDetail />}
				/>
				<Route
					path={ROUTES.APPLICANT_INTERVIEWS}
					element={<Interviews />}
				/>
				<Route path={ROUTES.APPLICANT_PROFILE} element={<Profile />} />
			</Route>

			<Route
				element={
					<RoleGuard
						allow={[USER_ROLES.HIRING_MANAGER, USER_ROLES.ADMIN]}
					>
						<RecruitmentLayout />
					</RoleGuard>
				}
			>
				<Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
				<Route
					path={ROUTES.JOB_LISTINGS}
					element={<JobListingsPage />}
				/>
				<Route
					path={ROUTES.JOB_LISTING_NEW}
					element={<JobListingFormPage />}
				/>
				<Route
					path={ROUTES.JOB_LISTING_EDIT()}
					element={<JobListingFormPage />}
				/>
				<Route
					path={ROUTES.JOB_DETAIL()}
					element={<JobDetailDashboardPage />}
				/>
				<Route
					path={ROUTES.JOB_APPLICATIONS()}
					element={<JobApplicationsPage />}
				/>
				<Route
					path={ROUTES.JOB_APPLICATION_DETAIL()}
					element={<JobApplicationDetailPage />}
				/>
			</Route>

			<Route
				element={
					<RoleGuard allow={USER_ROLES.ADMIN}>
						<RecruitmentLayout />
					</RoleGuard>
				}
			>
				<Route
					path={ROUTES.TEAM_MANAGEMENT}
					element={<TeamManagementPage />}
				/>
				<Route
					path={ROUTES.SCORECARD_TEMPLATES}
					element={<ScorecardTemplatesPage />}
				/>
				<Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
			</Route>

			<Route
				path={ROUTES.LEGACY_HM_HOME}
				element={<Navigate to={ROUTES.DASHBOARD} replace />}
			/>
			<Route
				path={ROUTES.LEGACY_ADMIN_HOME}
				element={<Navigate to={ROUTES.DASHBOARD} replace />}
			/>
			<Route
				path="/hm/*"
				element={<Navigate to={ROUTES.DASHBOARD} replace />}
			/>
			<Route
				path="/admin/*"
				element={<Navigate to={ROUTES.DASHBOARD} replace />}
			/>

			<Route path="*" element={<NotFound />} />
		</Routes>
	);
}

export default AppRoutes;
