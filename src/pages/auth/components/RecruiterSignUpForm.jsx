import { useState } from "react";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Button from "../../../components/common/Button";

const COMPANY_SIZES = [
	{ value: "1-10", label: "1–10 employees" },
	{ value: "11-50", label: "11–50 employees" },
	{ value: "51-200", label: "51–200 employees" },
	{ value: "201-500", label: "201–500 employees" },
	{ value: "501-1000", label: "501–1,000 employees" },
	{ value: "1000+", label: "1,000+ employees" },
];

function RecruiterSignUpForm({ initial, onSubmit, onBack }) {
	const [name, setName] = useState(initial?.name ?? "");
	const [email, setEmail] = useState(initial?.email ?? "");
	const [password, setPassword] = useState(initial?.password ?? "");
	const [companyName, setCompanyName] = useState(initial?.companyName ?? "");
	const [companyWebsite, setCompanyWebsite] = useState(
		initial?.companyWebsite ?? "",
	);
	const [companySize, setCompanySize] = useState(
		initial?.companySize ?? COMPANY_SIZES[0].value,
	);
	const [error, setError] = useState(null);

	function handleSubmit(e) {
		e.preventDefault();
		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		onSubmit({
			name,
			email,
			password,
			companyName,
			companyWebsite,
			companySize,
		});
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<section className="space-y-4">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
					About you
				</p>
				<Input
					label="Full name"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Ada Lovelace"
					autoComplete="name"
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
					hint="You'll be set up as the company admin."
				/>
			</section>

			<section className="space-y-4">
				<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
					About your company
				</p>
				<Input
					label="Company name"
					required
					value={companyName}
					onChange={(e) => setCompanyName(e.target.value)}
					placeholder="Acme Labs"
				/>
				<Input
					label="Company website"
					value={companyWebsite}
					onChange={(e) => setCompanyWebsite(e.target.value)}
					placeholder="https://acme.test"
				/>
				<Select
					label="Company size"
					value={companySize}
					onChange={(e) => setCompanySize(e.target.value)}
					options={COMPANY_SIZES}
				/>
			</section>

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

export default RecruiterSignUpForm;
