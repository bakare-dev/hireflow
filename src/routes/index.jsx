import { Navigate, Route, Routes } from "react-router";
import { ROUTES } from "../constants/routes";
import { USER_ROLES } from "../constants/roles";

import PublicLayout from "../layout/PublicLayout";
import ApplicantLayout from "../layout/ApplicantLayout";
import RecruitmentLayout from "../layout/RecruitmentLayout";
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
import JobDiscovery from "../pages/applicant/JobDiscovery";
import JobDetail from "../pages/applicant/JobDetail";
import MyApplications from "../pages/applicant/MyApplications";
import ApplicationDetail from "../pages/applicant/ApplicationDetail";
import Messages from "../pages/applicant/Messages";
import Interviews from "../pages/applicant/Interviews";
import Profile from "../pages/applicant/Profile";
import DashboardPage from "../pages/recruitment/DashboardPage";
import JobListingsPage from "../pages/recruitment/JobListingsPage";
import JobDetailDashboardPage from "../pages/recruitment/JobDetailDashboardPage";
import CandidatesPage from "../pages/recruitment/CandidatesPage";
import AIScreeningCenterPage from "../pages/recruitment/AIScreeningCenterPage";
import InterviewCalendarPage from "../pages/recruitment/InterviewCalendarPage";
import InterviewFeedbackWorkspacePage from "../pages/recruitment/InterviewFeedbackWorkspacePage";
import OffersDashboardPage from "../pages/recruitment/OffersDashboardPage";
import AnalyticsDashboardPage from "../pages/recruitment/AnalyticsDashboardPage";
import TeamManagementPage from "../pages/recruitment/TeamManagementPage";
import AuditLogsPage from "../pages/recruitment/AuditLogsPage";
import OrganizationSettingsPage from "../pages/recruitment/OrganizationSettingsPage";

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
					path={ROUTES.APPLICANT_MESSAGES}
					element={<Messages />}
				/>
				<Route
					path={ROUTES.APPLICANT_INTERVIEWS}
					element={<Interviews />}
				/>
				<Route
					path={ROUTES.APPLICANT_PROFILE}
					element={<Profile />}
				/>
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
				<Route
					path={ROUTES.DASHBOARD}
					element={<DashboardPage />}
				/>
				<Route
					path={ROUTES.JOB_LISTINGS}
					element={<JobListingsPage />}
				/>
				<Route
					path={ROUTES.JOB_DETAIL()}
					element={<JobDetailDashboardPage />}
				/>
				<Route
					path={ROUTES.CANDIDATES}
					element={<CandidatesPage />}
				/>
				<Route
					path={ROUTES.INTERVIEWS}
					element={<InterviewCalendarPage />}
				/>
				<Route
					path={ROUTES.INTERVIEW_FEEDBACK()}
					element={<InterviewFeedbackWorkspacePage />}
				/>
				<Route
					path={ROUTES.OFFERS}
					element={<OffersDashboardPage />}
				/>
				<Route
					path={ROUTES.AI_SCREENING}
					element={<AIScreeningCenterPage />}
				/>
				<Route
					path={ROUTES.ANALYTICS}
					element={<AnalyticsDashboardPage />}
				/>
				<Route
					path={ROUTES.MESSAGES}
					element={<ComingSoon title="Messages" />}
				/>
				<Route
					path={ROUTES.NOTIFICATIONS}
					element={<ComingSoon title="Notifications" />}
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
					path={ROUTES.AUDIT_LOGS}
					element={<AuditLogsPage />}
				/>
				<Route
					path={ROUTES.ORGANIZATION_SETTINGS}
					element={<OrganizationSettingsPage />}
				/>
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
