import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import {
	useLoginMutation,
	useRegisterMutation,
	useVerifyOtpMutation,
} from "../../api/authApi";
import { ROUTES } from "../../constants/routes";
import useToast from "../../hooks/useToast";
import { toRegistrationPayload } from "../../utils/api";
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

const ROLE_FROM_PARAM = {
	applicant: ROLE.APPLICANT,
	candidate: ROLE.APPLICANT,
	recruiter: ROLE.RECRUITER,
	hiring: ROLE.RECRUITER,
};

function SignUp() {
	const navigate = useNavigate();
	const location = useLocation();
	const toast = useToast();
	const [params] = useSearchParams();
	const pendingOtp =
		location.state?.step === "OTP" && location.state?.email
			? {
					email: location.state.email,
					password: location.state.password ?? "",
				}
			: null;
	const [register, { isLoading: registering }] = useRegisterMutation();
	const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
	const [login, { isLoading: resending }] = useLoginMutation();

	async function handleResend() {
		setOtp("");
		setOtpError(null);
		try {
			await login({
				email: formData.email,
				password: formData.password,
			}).unwrap();
			toast.success("Account already verified — please sign in.");
			navigate(ROUTES.SIGN_IN);
		} catch (err) {
			toast.success(
				err.data?.message ?? "A new OTP has been sent to your email.",
			);
		}
	}

	const presetRole = ROLE_FROM_PARAM[params.get("as")?.toLowerCase()] ?? null;

	const [lastPresetRole, setLastPresetRole] = useState(presetRole);
	const [step, setStep] = useState(
		pendingOtp ? STEP.OTP : presetRole ? STEP.FORM : STEP.ROLE,
	);
	const [role, setRole] = useState(presetRole);
	const [formData, setFormData] = useState(pendingOtp);

	if (presetRole && presetRole !== lastPresetRole) {
		setLastPresetRole(presetRole);
		setRole(presetRole);
		if (step === STEP.ROLE) setStep(STEP.FORM);
	}

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
			await verifyOtp({
				email: formData.email,
				otp,
			}).unwrap();
			toast.success("Account created. Please sign in to continue.");
			navigate(ROUTES.SIGN_IN);
		} catch (err) {
			setOtpError(
				err.data?.message ?? err.error ?? "OTP verification failed.",
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

				<Button type="submit" className="w-full" disabled={verifying}>
					{verifying ? "Verifying…" : "Verify and continue"}
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
					onClick={handleResend}
					disabled={resending}
					className="font-medium text-slate-900 hover:underline disabled:opacity-60"
				>
					{resending ? "Sending…" : "Resend code"}
				</button>
			</div>
		</div>
	);
}

export default SignUp;
