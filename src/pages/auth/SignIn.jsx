import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { signInWithEmail } from "../../store/slices/authSlice";
import { ROUTES } from "../../constants/routes";
import { ROLE_HOME_PATHS } from "../../constants/roles";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AuthHeader from "./components/AuthHeader";

function SignIn() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);

	async function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		setSubmitting(true);
		const action = await dispatch(signInWithEmail({ email, password }));
		setSubmitting(false);

		if (signInWithEmail.fulfilled.match(action)) {
			const next = ROLE_HOME_PATHS[action.payload.role] ?? ROUTES.LANDING;
			navigate(next);
		} else {
			setError(action.payload?.message ?? "Sign in failed.");
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

				<div className="flex items-center justify-between text-sm">
					<label className="flex items-center gap-2 text-slate-600">
						<input
							type="checkbox"
							className="h-4 w-4 rounded border-slate-300"
						/>
						Remember me
					</label>
					<Link
						to={ROUTES.PASSWORD_RESET}
						className="font-medium text-slate-900 hover:underline"
					>
						Forgot password?
					</Link>
				</div>

				{error ? (
					<p
						role="alert"
						className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200"
					>
						{error}
					</p>
				) : null}

				<Button type="submit" className="w-full" disabled={submitting}>
					{submitting ? "Signing in…" : "Sign in"}
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
