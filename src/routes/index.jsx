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
import ComingSoon from "../pages/shared/ComingSoon";
import Landing from "../pages/shared/Landing";
import Auth from "../pages/auth/Auth";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";
import PasswordReset from "../pages/auth/PasswordReset";
import AcceptInvite from "../pages/auth/AcceptInvite";
import CompanySetup from "../pages/auth/CompanySetup";
import JobDiscovery from "../pages/applicant/JobDiscovery";
import JobDetail from "../pages/applicant/JobDetail";
import MyApplications from "../pages/applicant/MyApplications";
import ApplicationDetail from "../pages/applicant/ApplicationDetail";
import Messages from "../pages/applicant/Messages";
import Interviews from "../pages/applicant/Interviews";
import Profile from "../pages/applicant/Profile";
import CompanyReviewsHome from "../pages/applicant/CompanyReviewsHome";
import CompanyProfilePage from "../pages/applicant/CompanyProfilePage";
import CompanyReviewsListPage from "../pages/applicant/CompanyReviewsListPage";
import CompanyReviewEntryPage from "../pages/applicant/CompanyReviewEntryPage";
import CompanyReviewTypeSelectionPage from "../pages/applicant/CompanyReviewTypeSelectionPage";
import CompanyReviewSubmissionPage from "../pages/applicant/CompanyReviewSubmissionPage";
import DashboardPage from "../pages/recruitment/DashboardPage";
import JobListingsPage from "../pages/recruitment/JobListingsPage";
import JobDetailDashboardPage from "../pages/recruitment/JobDetailDashboardPage";
import JobListingFormPage from "../pages/recruitment/JobListingFormPage";
import JobApplicationsPage from "../pages/recruitment/JobApplicationsPage";
import JobApplicationDetailPage from "../pages/recruitment/JobApplicationDetailPage";
import CandidatesPage from "../pages/recruitment/CandidatesPage";
import AIScreeningCenterPage from "../pages/recruitment/AIScreeningCenterPage";
import InterviewCalendarPage from "../pages/recruitment/InterviewCalendarPage";
import InterviewFeedbackWorkspacePage from "../pages/recruitment/InterviewFeedbackWorkspacePage";
import OffersDashboardPage from "../pages/recruitment/OffersDashboardPage";
import AnalyticsDashboardPage from "../pages/recruitment/AnalyticsDashboardPage";
import TeamManagementPage from "../pages/recruitment/TeamManagementPage";
import ScorecardTemplatesPage from "../pages/recruitment/ScorecardTemplatesPage";
import AuditLogsPage from "../pages/recruitment/AuditLogsPage";
import OrganizationSettingsPage from "../pages/recruitment/OrganizationSettingsPage";
import ReviewModerationPage from "../pages/recruitment/ReviewModerationPage";

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
				<Route
					path={ROUTES.PASSWORD_RESET}
					element={<PasswordReset />}
				/>
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
					path={ROUTES.APPLICANT_MESSAGES}
					element={<Messages />}
				/>
				<Route
					path={ROUTES.APPLICANT_INTERVIEWS}
					element={<Interviews />}
				/>
				<Route path={ROUTES.APPLICANT_PROFILE} element={<Profile />} />
				<Route
					path={ROUTES.APPLICANT_COMPANY_REVIEWS}
					element={<CompanyReviewsHome />}
				/>
				<Route
					path={ROUTES.APPLICANT_COMPANY_PROFILE()}
					element={<CompanyProfilePage />}
				/>
				<Route
					path={ROUTES.APPLICANT_COMPANY_REVIEWS_LIST()}
					element={<CompanyReviewsListPage />}
				/>
				<Route
					path={ROUTES.APPLICANT_COMPANY_REVIEW_NEW()}
					element={<CompanyReviewEntryPage />}
				/>
				<Route
					path={ROUTES.APPLICANT_COMPANY_REVIEW_TYPE()}
					element={<CompanyReviewTypeSelectionPage />}
				/>
				<Route
					path={ROUTES.APPLICANT_COMPANY_REVIEW_SUBMIT()}
					element={<CompanyReviewSubmissionPage />}
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
				<Route path={ROUTES.CANDIDATES} element={<CandidatesPage />} />
				<Route
					path={ROUTES.INTERVIEWS}
					element={<InterviewCalendarPage />}
				/>
				<Route
					path={ROUTES.INTERVIEW_FEEDBACK()}
					element={<InterviewFeedbackWorkspacePage />}
				/>
				<Route path={ROUTES.OFFERS} element={<OffersDashboardPage />} />
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
					path={ROUTES.SCORECARD_TEMPLATES}
					element={<ScorecardTemplatesPage />}
				/>
				<Route
					path={ROUTES.REVIEW_MODERATION}
					element={<ReviewModerationPage />}
				/>
				<Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
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
