import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardBody } from "../../components/common/Card";
import MatchPercentBar from "../../components/domain/MatchPercentBar";
import { ROUTES } from "../../constants/routes";
import {
	fetchCompanyProfile,
	fetchCompanyReviews,
	selectCompanyProfile,
	selectCompanyReviews,
} from "../../store/slices/companyReviewsSlice";
import { selectJobs } from "../../store/slices/jobsSlice";
import { JOB_LISTING_STATUS } from "../../constants/jobStatus";

function CompanyProfilePage() {
	const { companyId } = useParams();
	const dispatch = useDispatch();
	const profile = useSelector(selectCompanyProfile(companyId));
	const reviews = useSelector(selectCompanyReviews(companyId));
	const jobs = useSelector(selectJobs);
	const companyJobs = useMemo(
		() =>
			jobs.filter(
				(job) =>
					job.companyId === companyId && job.status === JOB_LISTING_STATUS.OPEN,
			),
		[jobs, companyId],
	);

	useEffect(() => {
		dispatch(fetchCompanyProfile(companyId));
		dispatch(fetchCompanyReviews({ companyId, filter: { sortBy: "recent" } }));
	}, [dispatch, companyId]);

	if (!profile) return null;

	return (
		<div className="space-y-6">
			<Card>
				<CardBody className="space-y-4">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm font-medium text-slate-500">Company Profile</p>
							<h1 className="mt-1 text-3xl font-semibold text-slate-950">
								{profile.company.name}
							</h1>
							<p className="mt-2 text-sm text-slate-600">
								Verified company · Applicant reputation insights enabled
							</p>
						</div>
						<p className="text-2xl font-semibold text-slate-900">
							{profile.overallScore}/10
						</p>
					</div>
					<MatchPercentBar value={profile.overallScore * 10} />
					<div className="grid gap-3 sm:grid-cols-4">
						<Metric label="Total Reviews" value={profile.totalReviews} />
						<Metric label="Recommendation" value={`${profile.recommendationPercentage}%`} />
						<Metric label="Open Jobs" value={companyJobs.length} />
						<Metric label="AI Reputation" value={`${Math.round(profile.overallScore * 10)}%`} />
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody className="space-y-3">
					<h2 className="text-lg font-semibold text-slate-900">Rating Breakdown</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{Object.entries(profile.categoryAverages).map(([category, value]) => (
							<div key={category}>
								<div className="mb-1 flex justify-between text-sm">
									<span>{category}</span>
									<span>{value}</span>
								</div>
								<div className="h-2 rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-slate-700"
										style={{ width: `${value * 10}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody className="space-y-3">
					<h2 className="text-lg font-semibold text-slate-900">Hiring Insights</h2>
					<p className="text-sm text-slate-700">
						Candidates praise candidate respect and culture consistency.
					</p>
					<p className="text-sm text-slate-700">
						Most common friction point is hiring speed between interview rounds.
					</p>
					<p className="text-sm text-slate-700">
						Technical interview quality trends strong for backend-oriented roles.
					</p>
					<div className="flex gap-2">
						<Link to={ROUTES.APPLICANT_COMPANY_REVIEWS_LIST(companyId)}>
							<button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
								See All Reviews
							</button>
						</Link>
						<Link to={ROUTES.APPLICANT_COMPANY_REVIEW_NEW(companyId)}>
							<button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm">
								Write Review
							</button>
						</Link>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody className="space-y-2">
					<h2 className="text-lg font-semibold text-slate-900">Open Jobs</h2>
					{companyJobs.length ? (
						companyJobs.map((job) => (
							<Link
								key={job.id}
								to={ROUTES.APPLICANT_JOB_DETAIL(job.id)}
								className="block rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
							>
								{job.title} · {job.location}
							</Link>
						))
					) : (
						<p className="text-sm text-slate-600">No open roles right now.</p>
					)}
				</CardBody>
			</Card>

			<Card>
				<CardBody className="space-y-2">
					<h2 className="text-lg font-semibold text-slate-900">Recent Reviews</h2>
					{reviews.slice(0, 3).map((review) => (
						<div key={review.id} className="rounded-lg border border-slate-200 px-3 py-2">
							<p className="text-sm font-medium text-slate-900">
								{review.anonymous ? "Anonymous Candidate" : review.authorUserId}
							</p>
							<p className="text-sm text-slate-700">{review.positiveExperience}</p>
						</div>
					))}
				</CardBody>
			</Card>
		</div>
	);
}

function Metric({ label, value }) {
	return (
		<div className="rounded-lg border border-slate-200 px-3 py-2">
			<p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
			<p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
		</div>
	);
}

export default CompanyProfilePage;
