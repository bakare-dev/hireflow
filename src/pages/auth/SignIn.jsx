import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "../../api/authApi";
import { setAuthenticatedUser } from "../../store/slices/authSlice";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME_PATHS } from "../../constants/roles";
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
			dispatch(setAuthenticatedUser(user));
			const next = ROLE_HOME_PATHS[user.role] ?? ROUTES.LANDING;
			navigate(next);
		} catch (err) {
			toast.error(err.data?.message ?? err.error ?? "Sign in failed.");
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

				<div className="flex justify-end text-sm">
					<Link
						to={ROUTES.PASSWORD_RESET}
						className="font-medium text-slate-900 hover:underline"
					>
						Forgot password?
					</Link>
				</div>

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

			<p className="text-center text-xs text-slate-400">
				Prototype tip: try{" "}
				<span className="font-mono">priya@example.com</span> or{" "}
				<span className="font-mono">harvey@acme.test</span>.
			</p>
		</div>
	);
}

export default SignIn;
