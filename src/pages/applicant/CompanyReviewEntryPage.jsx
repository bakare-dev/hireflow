import { Link, useParams } from "react-router";
import Card, { CardBody } from "../../components/common/Card";
import { ROUTES } from "../../constants/routes";

function CompanyReviewEntryPage() {
	const { companyId } = useParams();

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Write Review</p>
				<h1 className="mt-1 text-3xl font-semibold text-slate-950">
					Share your candidate experience
				</h1>
			</div>

			<Card>
				<CardBody className="space-y-4">
					<p className="text-sm text-slate-700">
						Your review helps future candidates reduce uncertainty and set clear expectations before applying.
					</p>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
							Entry points include rejected applications, completed interviews, hired flow, and company profile.
						</div>
						<div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
							You can submit anonymously. Identity will not be shown publicly.
						</div>
					</div>
					<Link to={ROUTES.APPLICANT_COMPANY_REVIEW_TYPE(companyId)}>
						<button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
							Start Review
						</button>
					</Link>
				</CardBody>
			</Card>
		</div>
	);
}

export default CompanyReviewEntryPage;
