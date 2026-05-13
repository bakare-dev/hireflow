import { useState } from "react";
import { useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import Input from "../../components/common/Input";
import PageHeader from "../../components/common/PageHeader";
import { selectAuthUser } from "../../store/slices/authSlice";
import { SEED_COMPANIES } from "../../data";

function OrganizationSettingsPage() {
	const user = useSelector(selectAuthUser);
	const company =
		SEED_COMPANIES.find((item) => item.id === user?.companyId) ?? null;
	const [state, setState] = useState({
		companyName: company?.name ?? "Organization",
		logo: "Not uploaded",
		pipelineStages: "Applied, Screening, Interview, Offer, Hired, Rejected",
		interviewDefaults: "45 minutes, 2 interviewers",
		offerApproval: "One-step approval",
		autoPassThreshold: String(company?.autoPassThreshold ?? 75),
		autoRejectThreshold: String(company?.autoRejectThreshold ?? 40),
		resumeRules: "Skill overlap + experience weighting",
		integrationMeet: "Connected",
		integrationCalendar: "Connected",
		integrationEmail: "Connected",
		webhookUrl: "https://example.com/webhooks/hireflow",
	});

	function update(field, value) {
		setState((current) => ({ ...current, [field]: value }));
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Administration"
				title="Organization Settings"
				description="Configure branding, workflow defaults, AI settings, and integration behavior."
				actions={<Button>Save settings</Button>}
			/>

			<div className="grid gap-5 xl:grid-cols-2">
				<SettingsCard title="Organization Profile">
					<Input
						label="Company name"
						value={state.companyName}
						onChange={(event) =>
							update("companyName", event.target.value)
						}
					/>
					<Input
						label="Logo"
						value={state.logo}
						onChange={(event) => update("logo", event.target.value)}
					/>
				</SettingsCard>
			</div>
		</div>
	);
}

function SettingsCard({ title, children }) {
	return (
		<Card>
			<CardHeader>
				<h2 className="text-sm font-semibold text-slate-900">
					{title}
				</h2>
			</CardHeader>
			<CardBody className="space-y-3">{children}</CardBody>
		</Card>
	);
}

export default OrganizationSettingsPage;
