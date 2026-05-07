import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { authService } from "../../services";
import { showToast } from "../../store/slices/uiSlice";
import { ROUTES } from "../../constants/routes";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthHeader from "./components/AuthHeader";
import OtpInput from "./components/OtpInput";

const STEP = Object.freeze({
	EMAIL: "EMAIL",
	OTP: "OTP",
	NEW_PASSWORD: "NEW_PASSWORD",
});

function PasswordReset() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [step, setStep] = useState(STEP.EMAIL);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);

	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");

	async function handleEmailSubmit(e) {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await authService.requestPasswordReset(email);
			setStep(STEP.OTP);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleOtpSubmit(e) {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await authService.verifyOtp(email, otp);
			setStep(STEP.NEW_PASSWORD);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	}

	async function handleNewPasswordSubmit(e) {
		e.preventDefault();
		setError(null);

		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmNewPassword) {
			setError("Passwords don't match.");
			return;
		}

		setSubmitting(true);
		try {
			await authService.resetPassword({
				email,
				code: otp,
				newPassword,
			});
			dispatch(
				showToast({
					tone: "success",
					message: "Password updated. Please sign in.",
				}),
			);
			navigate(ROUTES.SIGN_IN);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	}

	if (step === STEP.EMAIL) {
		return (
			<div className="space-y-8">
				<AuthHeader
					eyebrow="Step 1 of 3"
					title="Reset your password"
					subtitle="Enter the email associated with your account and we'll send a code."
				/>

				<form onSubmit={handleEmailSubmit} className="space-y-4">
					<Input
						label="Email"
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@company.com"
						autoComplete="email"
					/>

					{error ? (
						<p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
							{error}
						</p>
					) : null}

					<Button
						type="submit"
						className="w-full"
						disabled={submitting}
					>
						{submitting ? "Sending…" : "Send reset code"}
					</Button>
				</form>

				<p className="text-center text-sm text-slate-600">
					Remembered it?{" "}
					<Link
						to={ROUTES.SIGN_IN}
						className="font-medium text-slate-900 hover:underline"
					>
						Back to sign in
					</Link>
				</p>
			</div>
		);
	}

	if (step === STEP.OTP) {
		return (
			<div className="space-y-8">
				<AuthHeader
					eyebrow="Step 2 of 3"
					title="Enter the code"
					subtitle={
						<>
							We sent a 6-digit code to{" "}
							<span className="font-medium text-slate-900">
								{email}
							</span>
							.
						</>
					}
				/>

				<form onSubmit={handleOtpSubmit} className="space-y-6">
					<OtpInput value={otp} onChange={setOtp} error={error} />
					<Button
						type="submit"
						className="w-full"
						disabled={submitting}
					>
						{submitting ? "Verifying…" : "Verify code"}
					</Button>
				</form>

				<div className="flex items-center justify-between text-sm text-slate-600">
					<button
						type="button"
						onClick={() => {
							setStep(STEP.EMAIL);
							setOtp("");
							setError(null);
						}}
						className="font-medium text-slate-900 hover:underline"
					>
						← Use a different email
					</button>
					<button
						type="button"
						onClick={async () => {
							setOtp("");
							setError(null);
							await authService.requestPasswordReset(email);
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

	return (
		<div className="space-y-8">
			<AuthHeader
				eyebrow="Step 3 of 3"
				title="Choose a new password"
				subtitle="Pick something strong — at least 8 characters."
			/>

			<form onSubmit={handleNewPasswordSubmit} className="space-y-4">
				<Input
					label="New password"
					type="password"
					required
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					placeholder="At least 8 characters"
					autoComplete="new-password"
				/>
				<Input
					label="Confirm new password"
					type="password"
					required
					value={confirmNewPassword}
					onChange={(e) => setConfirmNewPassword(e.target.value)}
					placeholder="Re-enter it"
					autoComplete="new-password"
				/>

				{error ? (
					<p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
						{error}
					</p>
				) : null}

				<Button type="submit" className="w-full" disabled={submitting}>
					{submitting ? "Saving…" : "Update password"}
				</Button>
			</form>
		</div>
	);
}

export default PasswordReset;
