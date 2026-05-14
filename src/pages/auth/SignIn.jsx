import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../api/authApi";
import { companiesApi } from "../../api/companiesApi";
import { setAuthenticatedUser } from "../../store/slices/authSlice";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME_PATHS, USER_ROLES } from "../../constants/roles";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import useToast from "../../hooks/useToast";
import AuthHeader from "./components/AuthHeader";

function SignIn() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const [login, { isLoading }] = useLoginMutation();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	async function handleSubmit(e) {
		e.preventDefault();

		try {
			const user = await login({ email, password }).unwrap();

			let destination = ROLE_HOME_PATHS[user.role] ?? ROUTES.LANDING;
			let nextUser = user;
			if (user.role === USER_ROLES.ADMIN) {
				const result = await dispatch(
					companiesApi.endpoints.getMyCompany.initiate(),
				);
				const company = result?.data ?? null;
				if (result?.error || !company) {
					destination = ROUTES.COMPANY_SETUP;
				} else {
					nextUser = {
						...user,
						companyId: company.id ?? user.companyId ?? null,
						companyName: company.name ?? user.companyName ?? null,
					};
				}
			}

			dispatch(setAuthenticatedUser(nextUser));
			navigate(destination, { replace: true });
		} catch (err) {
			const message = err.data?.message ?? err.error ?? "Sign in failed.";
			if (/verify your email/i.test(message)) {
				toast.success(message);
				navigate(ROUTES.SIGN_UP, {
					state: { step: "OTP", email, password },
				});
				return;
			}
			toast.error(message);
		}
	}

	return (
		<div className="space-y-8">
			<AuthHeader
				eyebrow="Welcome back"
				title="Sign in to HireFlow"
				subtitle="Use the email associated with your account."
			/>

			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Email"
					type="email"
					autoComplete="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@company.com"
				/>
				<Input
					label="Password"
					type="password"
					autoComplete="current-password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="••••••••"
				/>

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Signing in…" : "Sign in"}
				</Button>
			</form>

			<p className="text-center text-sm text-slate-600">
				New to HireFlow?{" "}
				<Link
					to={ROUTES.SIGN_UP}
					className="font-medium text-slate-900 hover:underline"
				>
					Create an account
				</Link>
			</p>
		</div>
	);
}

export default SignIn;
