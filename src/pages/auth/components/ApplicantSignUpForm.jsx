import { useState } from "react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";

function ApplicantSignUpForm({ initial, onSubmit, onBack }) {
	const [name, setName] = useState(initial?.name ?? "");
	const [email, setEmail] = useState(initial?.email ?? "");
	const [password, setPassword] = useState(initial?.password ?? "");
	const [location, setLocation] = useState(initial?.location ?? "");
	const [skillsRaw, setSkillsRaw] = useState(
		(initial?.skills ?? []).join(", "),
	);
	const [error, setError] = useState(null);

	function handleSubmit(e) {
		e.preventDefault();
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		const skills = skillsRaw
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		onSubmit({ name, email, password, location, skills });
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				label="Full name"
				required
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="Ada Lovelace"
				autoComplete="name"
			/>
			<Input
				label="Email"
				type="email"
				required
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="you@example.com"
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
			<Input
				label="Location"
				value={location}
				onChange={(e) => setLocation(e.target.value)}
				placeholder="Lagos, NG"
			/>
			<Input
				label="Skills"
				value={skillsRaw}
				onChange={(e) => setSkillsRaw(e.target.value)}
				placeholder="React, TypeScript, Tailwind"
				hint="Comma-separated. We'll use these to match you to roles."
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
				<Button type="submit" className="flex-1">
					Continue
				</Button>
			</div>
		</form>
	);
}

export default ApplicantSignUpForm;
