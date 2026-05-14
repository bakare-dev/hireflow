import { useNavigate } from "react-router";
import { useCreateCompanyMutation } from "../../api/companiesApi";
import { ROUTES } from "../../constants/routes";
import useToast from "../../hooks/useToast";
import AuthHeader from "./components/AuthHeader";
import CompanyDetailsForm from "./components/CompanyDetailsForm";

function CompanySetup() {
	const navigate = useNavigate();
	const toast = useToast();
	const [createCompany, { isLoading: creating }] = useCreateCompanyMutation();

	async function handleSubmit(companyData) {
		try {
			await createCompany(companyData).unwrap();
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
