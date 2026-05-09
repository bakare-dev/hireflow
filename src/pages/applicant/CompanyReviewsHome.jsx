import { useEffect } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardBody } from "../../components/common/Card";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import { ROUTES } from "../../constants/routes";
import {
	fetchCompanySummaries,
	selectCompanySummaries,
} from "../../store/slices/companyReviewsSlice";

function CompanyReviewsHome() {
	const dispatch = useDispatch();
	const summaries = useSelector(selectCompanySummaries);

	useEffect(() => {
		dispatch(fetchCompanySummaries());
	}, [dispatch]);

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Company Reviews</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
					Understand companies before you apply.
				</h1>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{summaries.map((summary) => (
					<Card key={summary.company.id}>
						<CardBody className="space-y-3">
							<div className="flex items-start justify-between">
								<div>
									<p className="text-lg font-semibold text-slate-900">
										{summary.company.name}
									</p>
									<p className="text-sm text-slate-600">
										{summary.totalReviews} reviews
									</p>
								</div>
								<p className="text-lg font-semibold text-slate-900">
									{summary.overallScore}/10
								</p>
							</div>
							<MatchPercentBar value={summary.overallScore * 10} />
							<p className="text-sm text-slate-700">
								Recommendation rate: {summary.recommendationPercentage}%
							</p>
							<div className="flex gap-2">
								<Link to={ROUTES.APPLICANT_COMPANY_PROFILE(summary.company.id)}>
									<button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
										View Company Profile
									</button>
								</Link>
								<Link
									to={ROUTES.APPLICANT_COMPANY_REVIEWS_LIST(
										summary.company.id,
									)}
								>
									<button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
										See All Reviews
									</button>
								</Link>
							</div>
						</CardBody>
					</Card>
				))}
			</div>
		</div>
	);
}

export default CompanyReviewsHome;
