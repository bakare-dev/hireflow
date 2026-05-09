import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
	useRegisterMutation,
	useVerifyOtpMutation,
	useLoginMutation,
} from "../../api/authApi";
import { useCreateCompanyMutation } from "../../api/companiesApi";
import { ROUTES } from "../../constants/routes";
import useToast from "../../hooks/useToast";
import { toRegistrationPayload } from "../../utils/api";
import { apiHandler } from "../../services/api";
import AuthHeader from "./components/AuthHeader";
import SignUpRoleChoice from "./components/SignUpRoleChoice";
import ApplicantSignUpForm from "./components/ApplicantSignUpForm";
import RecruiterSignUpForm from "./components/RecruiterSignUpForm";
import CompanyDetailsForm from "./components/CompanyDetailsForm";
import OtpInput from "./components/OtpInput";
import Button from "../../components/common/Button";

const STEP = Object.freeze({
	ROLE: "ROLE",
	FORM: "FORM",
	OTP: "OTP",
	COMPANY: "COMPANY",
});

const ROLE = Object.freeze({
	APPLICANT: "APPLICANT",
	RECRUITER: "RECRUITER",
});

function SignUp() {
	const navigate = useNavigate();
	const toast = useToast();
	const [register, { isLoading: registering }] = useRegisterMutation();
	const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
	const [login, { isLoading: loggingIn }] = useLoginMutation();
	const [createCompany, { isLoading: creatingCompany }] =
		useCreateCompanyMutation();

	const [step, setStep] = useState(STEP.ROLE);
	const [role, setRole] = useState(null);
	const [formData, setFormData] = useState(null);

	const [otp, setOtp] = useState("");
	const [otpError, setOtpError] = useState(null);

	function pickRole(next) {
		setRole(next);
		setStep(STEP.FORM);
	}

	async function handleFormSubmit(data) {
		try {
			const response = await register(
				toRegistrationPayload(data, role),
			).unwrap();
			setFormData(data);
			setOtp("");
			setOtpError(null);
			toast.success(
				response?.message ??
					"Registration successful. Check your email for the OTP.",
			);
			setStep(STEP.OTP);
		} catch (err) {
			toast.error(
				err.data?.message ?? err.error ?? "Registration failed.",
			);
		}
	}

	async function handleVerify(e) {
		e.preventDefault();
		setOtpError(null);
		try {
			const response = await verifyOtp({
				email: formData.email,
				otp,
			}).unwrap();
			toast.success(response?.message ?? "Email verified successfully.");

			try {
				await login({
					email: formData.email,
					password: formData.password,
				}).unwrap();
				if (role === ROLE.APPLICANT) {
					navigate(ROUTES.APPLICANT.JOBS);
					return;
				}

				if (role === ROLE.RECRUITER) {
					try {
						const company = await apiHandler.get("/companies/me");
						if (company) {
							navigate(ROUTES.DASHBOARD);
						} else {
							setStep(STEP.COMPANY);
						}
					} catch {
						setStep(STEP.COMPANY);
					}
				}
			} catch (loginErr) {
				toast.error(
					loginErr.data?.message ??
						loginErr.error ??
						"Login failed after registration.",
				);
				navigate(ROUTES.SIGN_IN);
			}
		} catch (err) {
			setOtpError(
				err.data?.message ?? err.error ?? "OTP verification failed.",
			);
		}
	}

	async function handleCompanySubmit(companyData) {
		try {
			await createCompany(companyData).unwrap();
			toast.success("Company created successfully!");
			navigate(ROUTES.DASHBOARD);
		} catch (err) {
			toast.error(
				err.data?.message ?? err.error ?? "Company creation failed.",
			);
		}
	}

	if (step === STEP.ROLE) {
		return (
			<div className="space-y-8">
				<AuthHeader
					eyebrow="Create an account"
					title="How will you use HireFlow?"
					subtitle="You can change this later — but it shapes what you'll see first."
				/>
				<SignUpRoleChoice onPick={pickRole} />
				<p className="text-center text-sm text-slate-600">
					Already have an account?{" "}
					<Link
						to={ROUTES.SIGN_IN}
						className="font-medium text-slate-900 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		);
	}

	if (step === STEP.FORM) {
		return (
			<div className="space-y-8">
				<AuthHeader
					eyebrow={
						role === ROLE.APPLICANT
							? "Step 2 of 3 · Applicant"
							: "Step 2 of 3 · Recruiter"
					}
					title={
						role === ROLE.APPLICANT
							? "Tell us about you"
							: "Tell us about you"
					}
					subtitle={
						role === ROLE.APPLICANT
							? "We'll use this to match you to roles and pre-fill applications."
							: "You'll be set up as the company admin. Add your company details after verifying your email."
					}
				/>
				{role === ROLE.APPLICANT ? (
					<ApplicantSignUpForm
						initial={formData}
						onSubmit={handleFormSubmit}
						onBack={() => setStep(STEP.ROLE)}
						submitting={registering}
					/>
				) : (
					<RecruiterSignUpForm
						initial={formData}
						onSubmit={handleFormSubmit}
						onBack={() => setStep(STEP.ROLE)}
						submitting={registering}
					/>
				)}
			</div>
		);
	}

	if (step === STEP.COMPANY) {
		return (
			<div className="space-y-8">
				<AuthHeader
					eyebrow="Complete your profile"
					title="Tell us about your company"
					subtitle="This helps us set up your recruitment workspace. You can edit these details later."
				/>
				<CompanyDetailsForm
					onSubmit={handleCompanySubmit}
					submitting={creatingCompany}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<AuthHeader
				eyebrow="Step 3 of 3 · Verify"
				title="Confirm your email"
				subtitle={
					<>
						We sent a 6-digit code to{" "}
						<span className="font-medium text-slate-900">
							{formData?.email}
						</span>
						. Enter it below to finish setting up your account.
					</>
				}
			/>

			<form onSubmit={handleVerify} className="space-y-6">
				<OtpInput value={otp} onChange={setOtp} error={otpError} />

				<Button
					type="submit"
					className="w-full"
					disabled={verifying || loggingIn}
				>
					{verifying
						? "Verifying…"
						: loggingIn
							? "Logging in…"
							: "Verify and continue"}
				</Button>
			</form>

			<div className="flex items-center justify-between text-sm text-slate-600">
				<button
					type="button"
					onClick={() => setStep(STEP.FORM)}
					className="font-medium text-slate-900 hover:underline"
				>
					← Edit details
				</button>
				<button
					type="button"
					onClick={async () => {
						setOtp("");
						setOtpError(null);
						try {
							const response = await register(
								toRegistrationPayload(formData, role),
							).unwrap();
							toast.success(
								response?.message ??
									"We sent a fresh OTP to your email.",
							);
						} catch (err) {
							toast.error(
								err.data?.message ??
									err.error ??
									"Unable to resend OTP.",
							);
						}
					}}
					className="font-medium text-slate-900 hover:underline"
				>
					Resend code
				</button>
			</div>
		</div>
	);
}

export default SignUp;
