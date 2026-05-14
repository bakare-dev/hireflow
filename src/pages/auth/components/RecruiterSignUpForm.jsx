import { useState } from "react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

function RecruiterSignUpForm({
	initial,
	onSubmit,
	onBack,
	submitting = false,
}) {
	const [firstName, setFirstName] = useState(initial?.firstName ?? "");
	const [lastName, setLastName] = useState(initial?.lastName ?? "");
	const [email, setEmail] = useState(initial?.email ?? "");
	const [password, setPassword] = useState(initial?.password ?? "");
	const [error, setError] = useState(null);

	function handleSubmit(e) {
		e.preventDefault();
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		onSubmit({
			firstName,
			lastName,
			email,
			password,
		});
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="First name"
				required
				value={firstName}
				onChange={(e) => setFirstName(e.target.value)}
				placeholder="Ada"
				autoComplete="given-name"
			/>
			<Input
				label="Last name"
				required
				value={lastName}
				onChange={(e) => setLastName(e.target.value)}
				placeholder="Lovelace"
				autoComplete="family-name"
			/>
			<Input
				label="Work email"
				type="email"
				required
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="you@yourcompany.com"
				autoComplete="email"
			/>
			<Input
				label="Password"
				type="password"
				required
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="At least 8 characters"
				autoComplete="new-password"
				hint="At least 8 characters."
			/>

			{error ? (
				<p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
					{error}
				</p>
			) : null}

			<div className="flex items-center justify-between gap-3 pt-2">
				<Button type="button" variant="ghost" onClick={onBack}>
					Back
				</Button>
				<Button type="submit" className="flex-1" disabled={submitting}>
					{submitting ? "Creating account..." : "Continue"}
				</Button>
			</div>
		</form>
	);
}

export default RecruiterSignUpForm;
