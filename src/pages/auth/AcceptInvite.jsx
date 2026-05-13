import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useDispatch } from "react-redux";
import { useAcceptInviteMutation } from "../../api/authApi";
import { setAuthenticatedUser } from "../../store/slices/authSlice";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME_PATHS } from "../../constants/roles";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import useToast from "../../hooks/useToast";
import AuthHeader from "./components/AuthHeader";

function AcceptInvite() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const [params] = useSearchParams();
	const token = useMemo(() => params.get("token")?.trim() ?? "", [params]);
	const [acceptInvite, { isLoading }] = useAcceptInviteMutation();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [password, setPassword] = useState("");

	const missingToken = !token;

	async function handleSubmit(event) {
		event.preventDefault();
		if (missingToken) return;
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters.");
			return;
		}
		try {
			const user = await acceptInvite({
				token,
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				password,
			}).unwrap();
			dispatch(setAuthenticatedUser(user));
			toast.success("Welcome to HireFlow.");
			navigate(ROLE_HOME_PATHS[user.role] ?? ROUTES.DASHBOARD, {
				replace: true,
			});
		} catch (err) {
			toast.error(
				err.data?.message ??
					err.error ??
					"Unable to accept this invitation.",
			);
		}
	}

	if (missingToken) {
		return (
			<div className="space-y-6">
				<AuthHeader
					eyebrow="Invitation"
					title="Invitation link is missing or expired"
					subtitle="Open the link from the original invitation email. If it keeps failing, ask the admin who invited you to resend it."
				/>
				<Link
					to={ROUTES.SIGN_IN}
					className="text-sm font-medium text-slate-900 hover:underline"
				>
					Back to sign in
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<AuthHeader
				eyebrow="HR Manager invitation"
				title="Finish setting up your account"
				subtitle="Pick a name and password to activate your access. You will be signed in automatically."
			/>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid gap-3 sm:grid-cols-2">
					<Input
						label="First name"
						autoComplete="given-name"
						required
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
					/>
					<Input
						label="Last name"
						autoComplete="family-name"
						required
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
					/>
				</div>
				<Input
					label="Password"
					type="password"
					autoComplete="new-password"
					required
					minLength={8}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="At least 8 characters"
				/>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Activating account…" : "Accept invitation"}
				</Button>
			</form>

			<p className="text-center text-sm text-slate-600">
				Already activated?{" "}
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

export default AcceptInvite;
