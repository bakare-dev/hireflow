import { useState } from "react";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Button from "../../../components/common/Button";

const INDUSTRIES = [
	{ value: "", label: "Select an industry" },
	{ value: "Accounting", label: "Accounting" },
	{ value: "Advertising & Marketing", label: "Advertising & Marketing" },
	{ value: "Aerospace & Defense", label: "Aerospace & Defense" },
	{ value: "Agriculture", label: "Agriculture" },
	{ value: "Architecture & Engineering", label: "Architecture & Engineering" },
	{ value: "Automotive", label: "Automotive" },
	{ value: "Banking & Finance", label: "Banking & Finance" },
	{ value: "Biotechnology", label: "Biotechnology" },
	{ value: "Construction", label: "Construction" },
	{ value: "Consulting", label: "Consulting" },
	{ value: "Consumer Goods", label: "Consumer Goods" },
	{ value: "Education", label: "Education" },
	{ value: "Energy & Utilities", label: "Energy & Utilities" },
	{ value: "Entertainment & Media", label: "Entertainment & Media" },
	{ value: "Environmental Services", label: "Environmental Services" },
	{ value: "Food & Beverage", label: "Food & Beverage" },
	{ value: "Government & Public Sector", label: "Government & Public Sector" },
	{ value: "Healthcare", label: "Healthcare" },
	{ value: "Hospitality & Tourism", label: "Hospitality & Tourism" },
	{ value: "Human Resources", label: "Human Resources" },
	{ value: "Information Technology", label: "Information Technology" },
	{ value: "Insurance", label: "Insurance" },
	{ value: "Legal Services", label: "Legal Services" },
	{ value: "Logistics & Supply Chain", label: "Logistics & Supply Chain" },
	{ value: "Manufacturing", label: "Manufacturing" },
	{ value: "Non-Profit", label: "Non-Profit" },
	{ value: "Pharmaceutical", label: "Pharmaceutical" },
	{ value: "Real Estate", label: "Real Estate" },
	{ value: "Retail", label: "Retail" },
	{ value: "Software & SaaS", label: "Software & SaaS" },
	{ value: "Telecommunications", label: "Telecommunications" },
	{ value: "Transportation", label: "Transportation" },
	{ value: "Other", label: "Other" },
];

const COMPANY_SIZES = [
	{ value: "1-10", label: "1–10 employees" },
	{ value: "11-50", label: "11–50 employees" },
	{ value: "51-200", label: "51–200 employees" },
	{ value: "201-500", label: "201–500 employees" },
	{ value: "501-1000", label: "501–1,000 employees" },
	{ value: "1000+", label: "1,000+ employees" },
];

function CompanyDetailsForm({ onSubmit, submitting = false }) {
	const [companyName, setCompanyName] = useState("");
	const [companyWebsite, setCompanyWebsite] = useState("");
	const [companySize, setCompanySize] = useState(COMPANY_SIZES[0].value);
	const [industry, setIndustry] = useState(INDUSTRIES[0].value);
	const [error, setError] = useState(null);

	function handleSubmit(e) {
		e.preventDefault();
		if (!companyName.trim()) {
			setError("Company name is required.");
			return;
		}
		onSubmit({
			name: companyName,
			website: companyWebsite || undefined,
			companySize,
			industry: industry || undefined,
		});
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
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
				label="Industry"
				value={industry}
				onChange={(e) => setIndustry(e.target.value)}
				options={INDUSTRIES}
			/>
			<Select
				label="Company size"
				value={companySize}
				onChange={(e) => setCompanySize(e.target.value)}
				options={COMPANY_SIZES}
			/>

			{error ? (
				<p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
					{error}
				</p>
			) : null}

			<div className="flex gap-3 pt-2">
				<Button type="submit" className="flex-1" disabled={submitting}>
					{submitting ? "Creating company…" : "Create company"}
				</Button>
			</div>
		</form>
	);
}

export default CompanyDetailsForm;
