import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router";
import {
	useCreateCompanyMutation,
	useGetMyCompanyQuery,
} from "../../api/companiesApi";
import { ROUTES } from "../../constants/routes";
import useToast from "../../hooks/useToast";
import {
	selectAuthUser,
	setAuthenticatedUser,
} from "../../store/slices/authSlice";
import AuthHeader from "./components/AuthHeader";
import CompanyDetailsForm from "./components/CompanyDetailsForm";

function CompanySetup() {
	const navigate = useNavigate();
	const toast = useToast();
	const dispatch = useDispatch();
	const user = useSelector(selectAuthUser);
	const [createCompany, { isLoading: creating }] = useCreateCompanyMutation();

	const { data: existingCompany, isLoading: loadingExisting } =
		useGetMyCompanyQuery();
	if (loadingExisting) return null;
	if (existingCompany) {
		return <Navigate to={ROUTES.DASHBOARD} replace />;
	}

	async function handleSubmit(companyData) {
		try {
			const created = await createCompany(companyData).unwrap();

			if (user) {
				dispatch(
					setAuthenticatedUser({
						...user,
						companyId: created?.id ?? user.companyId ?? null,
						companyName:
							created?.name ??
							companyData?.name ??
							user.companyName ??
							null,
					}),
				);
			}
			toast.success("Company created successfully!");
			navigate(ROUTES.DASHBOARD, { replace: true });
		} catch (err) {
			toast.error(
				err.data?.message ?? err.error ?? "Company creation failed.",
			);
		}
	}

	return (
		<div className="space-y-8">
			<AuthHeader
				eyebrow="Complete your profile"
				title="Tell us about your company"
				subtitle="This helps us set up your recruitment workspace. You can edit these details later."
			/>
			<CompanyDetailsForm onSubmit={handleSubmit} submitting={creating} />
		</div>
	);
}

export default CompanySetup;
