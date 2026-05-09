import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardBody } from "../../components/common/Card";
import Input from "../../components/common/Input";
import { ROUTES } from "../../constants/routes";
import {
	fetchCompanyProfile,
	fetchCompanyReviews,
	selectCompanyProfile,
	selectCompanyReviews,
} from "../../store/slices/companyReviewsSlice";
import { formatDate } from "../../utils/date";

function CompanyReviewsListPage() {
	const { companyId } = useParams();
	const dispatch = useDispatch();
	const profile = useSelector(selectCompanyProfile(companyId));
	const reviews = useSelector(selectCompanyReviews(companyId));
	const [sortBy, setSortBy] = useState("recent");
	const [stage, setStage] = useState("ALL");
	const [anonymousOnly, setAnonymousOnly] = useState(false);
	const [query, setQuery] = useState("");

	useEffect(() => {
		dispatch(fetchCompanyProfile(companyId));
	}, [dispatch, companyId]);

	useEffect(() => {
		dispatch(
			fetchCompanyReviews({
				companyId,
				filter: { sortBy, stage, anonymousOnly, query },
			}),
		);
	}, [dispatch, companyId, sortBy, stage, anonymousOnly, query]);

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Company Reviews</p>
				<h1 className="mt-1 text-3xl font-semibold text-slate-950">
					{profile?.company.name ?? "Company"} Reviews
				</h1>
			</div>

			<Card>
				<CardBody className="grid gap-3 md:grid-cols-4">
					<div className="rounded-lg border border-slate-200 px-3 py-2">
						<p className="text-xs uppercase tracking-wide text-slate-500">Overall score</p>
						<p className="mt-1 text-xl font-semibold text-slate-900">
							{profile?.overallScore ?? 0}/10
						</p>
					</div>
					<div className="rounded-lg border border-slate-200 px-3 py-2">
						<p className="text-xs uppercase tracking-wide text-slate-500">Total reviews</p>
						<p className="mt-1 text-xl font-semibold text-slate-900">
							{profile?.totalReviews ?? 0}
						</p>
					</div>
					<div className="rounded-lg border border-slate-200 px-3 py-2">
						<p className="text-xs uppercase tracking-wide text-slate-500">Recommendation</p>
						<p className="mt-1 text-xl font-semibold text-slate-900">
							{profile?.recommendationPercentage ?? 0}%
						</p>
					</div>
					<Link to={ROUTES.APPLICANT_COMPANY_REVIEW_NEW(companyId)}>
						<div className="flex h-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
							Write Review
						</div>
					</Link>
				</CardBody>
			</Card>

			<Card>
				<CardBody className="grid gap-3 md:grid-cols-4">
					<label className="block">
						<span className="mb-1 block text-sm font-medium text-slate-800">Sort</span>
						<select
							value={sortBy}
							onChange={(event) => setSortBy(event.target.value)}
							className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
						>
							<option value="recent">Most recent</option>
							<option value="highest">Highest rated</option>
							<option value="lowest">Lowest rated</option>
						</select>
					</label>
					<label className="block">
						<span className="mb-1 block text-sm font-medium text-slate-800">Interview stage</span>
						<select
							value={stage}
							onChange={(event) => setStage(event.target.value)}
							className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
						>
							<option value="ALL">All stages</option>
							<option value="APPLIED">Applied</option>
							<option value="SCREENING">Screening</option>
							<option value="INTERVIEW_SCHEDULED">Interview</option>
							<option value="OFFER_SENT">Offer</option>
							<option value="REJECTED">Rejected</option>
						</select>
					</label>
					<label className="mt-7 flex items-center gap-2 text-sm text-slate-700">
						<input
							type="checkbox"
							checked={anonymousOnly}
							onChange={(event) => setAnonymousOnly(event.target.checked)}
						/>
						Anonymous only
					</label>
					<Input
						label="Search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="backend interview"
					/>
				</CardBody>
			</Card>

			<div className="space-y-3">
				{reviews.map((review) => (
					<Card key={review.id}>
						<CardBody className="space-y-2">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<p className="font-medium text-slate-900">
									{review.anonymous ? "Anonymous Candidate" : review.authorUserId}
								</p>
								<p className="text-xs text-slate-500">{formatDate(review.createdAt)}</p>
							</div>
							<p className="text-sm text-slate-600">
								Role: {review.roleAppliedFor} · Stage: {review.interviewStageReached}
							</p>
							<div className="flex flex-wrap gap-2">
								{Object.entries(review.ratings).map(([category, value]) => (
									<span
										key={category}
										className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700"
									>
										{category}: {value}
									</span>
								))}
							</div>
							<p className="text-sm text-slate-700">{review.positiveExperience}</p>
							<p className="text-sm text-slate-700">{review.negativeExperience}</p>
							<p className="text-sm text-slate-700">{review.adviceForCandidates}</p>
							<p className="text-sm font-medium text-slate-800">
								Recommendation: {review.recommendation}
							</p>
						</CardBody>
					</Card>
				))}
			</div>
		</div>
	);
}

export default CompanyReviewsListPage;
