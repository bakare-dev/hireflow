import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { signUpApplicant, signUpRecruiter } from "../../store/slices/authSlice";
import { authService } from "../../services";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME_PATHS } from "../../constants/roles";
import AuthHeader from "./components/AuthHeader";
import SignUpRoleChoice from "./components/SignUpRoleChoice";
import ApplicantSignUpForm from "./components/ApplicantSignUpForm";
import RecruiterSignUpForm from "./components/RecruiterSignUpForm";
import OtpInput from "./components/OtpInput";
import Button from "../../components/common/Button";

const STEP = Object.freeze({
	ROLE: "ROLE",
	FORM: "FORM",
	OTP: "OTP",
});

const ROLE = Object.freeze({
	APPLICANT: "APPLICANT",
	RECRUITER: "RECRUITER",
});

function SignUp() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [step, setStep] = useState(STEP.ROLE);
	const [role, setRole] = useState(null);
	const [formData, setFormData] = useState(null);

	const [otp, setOtp] = useState("");
	const [otpError, setOtpError] = useState(null);
	const [submitting, setSubmitting] = useState(false);

	function pickRole(next) {
		setRole(next);
		setStep(STEP.FORM);
	}

	async function handleFormSubmit(data) {
		setFormData(data);
		await authService.requestOtp(data.email);
		setStep(STEP.OTP);
	}

	async function handleVerify(e) {
		e.preventDefault();
		setOtpError(null);
		setSubmitting(true);
		try {
			await authService.verifyOtp(formData.email, otp);
			const action =
				role === ROLE.APPLICANT
					? await dispatch(signUpApplicant(formData))
					: await dispatch(signUpRecruiter(formData));

			if (
				signUpApplicant.fulfilled.match(action) ||
				signUpRecruiter.fulfilled.match(action)
			) {
				const next =
					ROLE_HOME_PATHS[action.payload.role] ?? ROUTES.LANDING;
				navigate(next);
				return;
			}
			setOtpError(action.payload?.message ?? "Sign up failed.");
		} catch (err) {
			setOtpError(err.message);
		} finally {
			setSubmitting(false);
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
							: "Onboard you and your company"
					}
					subtitle={
						role === ROLE.APPLICANT
							? "We'll use this to match you to roles and pre-fill applications."
							: "You'll be set up as the company's admin. Invite hiring managers later."
					}
				/>
				{role === ROLE.APPLICANT ? (
					<ApplicantSignUpForm
						initial={formData}
						onSubmit={handleFormSubmit}
						onBack={() => setStep(STEP.ROLE)}
					/>
				) : (
					<RecruiterSignUpForm
						initial={formData}
						onSubmit={handleFormSubmit}
						onBack={() => setStep(STEP.ROLE)}
					/>
				)}
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

				<Button type="submit" className="w-full" disabled={submitting}>
					{submitting ? "Verifying…" : "Verify and continue"}
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
						await authService.requestOtp(formData.email);
					}}
					className="font-medium text-slate-900 hover:underline"
				>
					Resend code
				</button>
			</div>

			<p className="text-center text-xs text-slate-400">
				Prototype: any 6-digit code is accepted.
			</p>
		</div>
	);
}

export default SignUp;
