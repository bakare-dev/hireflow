import { Link, useParams, useSearchParams } from "react-router";
import Card, { CardBody } from "../../components/common/Card";
import { ROUTES } from "../../constants/routes";

const TYPES = [
	{
		key: "recruitment",
		title: "Recruitment Experience",
		description: "Interview process, recruiter communication, candidate respect, hiring speed.",
	},
	{
		key: "workplace",
		title: "Workplace Experience",
		description: "Culture, work-life balance, leadership, team collaboration.",
	},
	{
		key: "compensation",
		title: "Compensation & Transparency",
		description: "Salary transparency, benefits clarity, offer fairness.",
	},
	{
		key: "technical",
		title: "Technical Hiring",
		description: "Technical interview quality, assessment relevance, fairness of evaluation.",
	},
];

function CompanyReviewTypeSelectionPage() {
	const { companyId } = useParams();
	const [params] = useSearchParams();
	const selected = params.get("type");

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Review Type Selection</p>
				<h1 className="mt-1 text-3xl font-semibold text-slate-950">
					What would you like to review?
				</h1>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{TYPES.map((type) => (
					<Card key={type.key}>
						<CardBody className="space-y-2">
							<p className="text-lg font-semibold text-slate-900">{type.title}</p>
							<p className="text-sm text-slate-700">{type.description}</p>
							<Link to={`?type=${type.key}`}>
								<button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
									{selected === type.key ? "Selected" : "Select"}
								</button>
							</Link>
						</CardBody>
					</Card>
				))}
			</div>
			{selected ? (
				<Link to={`${ROUTES.APPLICANT_COMPANY_REVIEW_SUBMIT(companyId)}?type=${selected}`}>
					<button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
						Continue to Review Form
					</button>
				</Link>
			) : null}
		</div>
	);
}

export default CompanyReviewTypeSelectionPage;
