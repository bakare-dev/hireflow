import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Card, { CardBody } from "../../components/common/Card";
import { ROUTES } from "../../constants/routes";
import { submitCompanyReview } from "../../store/slices/companyReviewsSlice";
import { selectAuthUser } from "../../store/slices/authSlice";
import useToast from "../../hooks/useToast";

const CATEGORIES = [
	"Culture",
	"Professionalism",
	"Communication",
	"Interview Experience",
	"Salary Transparency",
	"Work-Life Balance",
	"Hiring Speed",
	"Candidate Respect",
];

function CompanyReviewSubmissionPage() {
	const { companyId } = useParams();
	const [params] = useSearchParams();
	const type = params.get("type") ?? "recruitment";
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(selectAuthUser);
	const toast = useToast();
	const [step, setStep] = useState(0);
	const [selectedCategories, setSelectedCategories] = useState(["Communication"]);
	const [ratings, setRatings] = useState(() => defaultRatings());
	const [positiveExperience, setPositiveExperience] = useState("");
	const [negativeExperience, setNegativeExperience] = useState("");
	const [adviceForCandidates, setAdviceForCandidates] = useState("");
	const [recommendation, setRecommendation] = useState("WOULD_APPLY_AGAIN");
	const [wouldInterviewAgain, setWouldInterviewAgain] = useState("YES");
	const [feedbackFair, setFeedbackFair] = useState("YES");
	const [anonymous, setAnonymous] = useState(true);
	const [submitted, setSubmitted] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const steps = [
		"Select Categories",
		"Rate Categories",
		"Written Experience",
		"Recommendation",
		"Anonymous Toggle",
		"Review Preview",
	];

	function toggleCategory(category) {
		setSelectedCategories((current) =>
			current.includes(category)
				? current.filter((item) => item !== category)
				: [...current, category],
		);
	}

	async function submitReview() {
		setSubmitting(true);
		const action = await dispatch(
			submitCompanyReview({
				companyId,
				authorUserId: user?.id ?? "anonymous",
				anonymous,
				roleAppliedFor: "General candidate feedback",
				interviewStageReached: "INTERVIEW_SCHEDULED",
				recommendation,
				ratings: selectedCategories.reduce((acc, category) => {
					acc[category] = ratings[category] ?? 5;
					return acc;
				}, {}),
				positiveExperience,
				negativeExperience,
				adviceForCandidates,
				metadata: { type, wouldInterviewAgain, feedbackFair },
			}),
		);
		setSubmitting(false);
		if (submitCompanyReview.fulfilled.match(action)) {
			setSubmitted(true);
			toast.success("Review submitted. Moderation pending.");
		} else {
			toast.error(action.error?.message ?? "Unable to submit review.");
		}
	}

	const preview = useMemo(
		() => ({
			type,
			selectedCategories,
			ratings,
			positiveExperience,
			negativeExperience,
			adviceForCandidates,
			recommendation,
			wouldInterviewAgain,
			feedbackFair,
			anonymous,
		}),
		[
			type,
			selectedCategories,
			ratings,
			positiveExperience,
			negativeExperience,
			adviceForCandidates,
			recommendation,
			wouldInterviewAgain,
			feedbackFair,
			anonymous,
		],
	);

	if (submitted) {
		return (
			<div className="space-y-6">
				<Card>
					<CardBody className="space-y-3">
						<p className="text-sm font-medium text-slate-500">Review Submitted</p>
						<h1 className="text-2xl font-semibold text-slate-950">Thank you for sharing your experience.</h1>
						<p className="text-sm text-slate-700">
							Your review is pending moderation before it appears publicly.
						</p>
						<Link to={ROUTES.APPLICANT_COMPANY_PROFILE(companyId)}>
							<button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
								Back to Company Profile
							</button>
						</Link>
					</CardBody>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Review Submission Flow</p>
				<h1 className="mt-1 text-3xl font-semibold text-slate-950">
					Step {step + 1}: {steps[step]}
				</h1>
			</div>

			<Card>
				<CardBody className="space-y-4">
					{step === 0 ? (
						<div className="grid gap-2 sm:grid-cols-2">
							{CATEGORIES.map((category) => (
								<label key={category} className="flex items-center gap-2 text-sm">
									<input
										type="checkbox"
										checked={selectedCategories.includes(category)}
										onChange={() => toggleCategory(category)}
									/>
									{category}
								</label>
							))}
						</div>
					) : null}

					{step === 1 ? (
						<div className="space-y-3">
							{selectedCategories.map((category) => (
								<label key={category} className="block">
									<div className="mb-1 flex justify-between text-sm">
										<span>{category}</span>
										<span>{ratings[category]}</span>
									</div>
									<input
										type="range"
										min={1}
										max={10}
										value={ratings[category]}
										onChange={(event) =>
											setRatings((current) => ({
												...current,
												[category]: Number(event.target.value),
											}))
										}
										className="w-full"
									/>
								</label>
							))}
						</div>
					) : null}

					{step === 2 ? (
						<div className="space-y-3">
							<TextArea label="Positive experience" value={positiveExperience} onChange={setPositiveExperience} />
							<TextArea label="Negative experience" value={negativeExperience} onChange={setNegativeExperience} />
							<TextArea label="Advice for future candidates" value={adviceForCandidates} onChange={setAdviceForCandidates} />
						</div>
					) : null}

					{step === 3 ? (
						<div className="grid gap-3 sm:grid-cols-2">
							<Select label="Would you recommend applying?" value={recommendation} onChange={setRecommendation} options={[
								["WOULD_APPLY_AGAIN", "Would apply again"],
								["NEUTRAL", "Neutral experience"],
								["WOULD_NOT_RECOMMEND", "Would not recommend"],
							]} />
							<Select label="Would you interview again?" value={wouldInterviewAgain} onChange={setWouldInterviewAgain} options={[
								["YES", "Yes"],
								["NO", "No"],
							]} />
							<Select label="Was feedback fair?" value={feedbackFair} onChange={setFeedbackFair} options={[
								["YES", "Yes"],
								["NO", "No"],
							]} />
						</div>
					) : null}

					{step === 4 ? (
						<label className="flex items-center gap-2 text-sm">
							<input
								type="checkbox"
								checked={anonymous}
								onChange={(event) => setAnonymous(event.target.checked)}
							/>
							Submit anonymously. Your identity will not be shown publicly.
						</label>
					) : null}

					{step === 5 ? (
						<pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
							{JSON.stringify(preview, null, 2)}
						</pre>
					) : null}
				</CardBody>
			</Card>

			<div className="flex gap-2">
				{step > 0 ? (
					<button
						onClick={() => setStep((current) => Math.max(0, current - 1))}
						className="rounded-md border border-slate-200 px-4 py-2 text-sm"
					>
						Back
					</button>
				) : null}
				{step < steps.length - 1 ? (
					<button
						onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
						className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white"
					>
						Continue
					</button>
				) : (
					<button
						onClick={submitReview}
						disabled={submitting}
						className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
					>
						{submitting ? "Submitting..." : "Submit Review"}
					</button>
				)}
				<button
					onClick={() => navigate(ROUTES.APPLICANT_COMPANY_PROFILE(companyId))}
					className="rounded-md border border-slate-200 px-4 py-2 text-sm"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}

function defaultRatings() {
	return CATEGORIES.reduce((acc, category) => {
		acc[category] = 7;
		return acc;
	}, {});
}

function TextArea({ label, value, onChange }) {
	return (
		<label className="block">
			<span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
			<textarea
				rows={4}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
			/>
		</label>
	);
}

function Select({ label, value, onChange, options }) {
	return (
		<label className="block">
			<span className="mb-1 block text-sm font-medium text-slate-800">{label}</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
			>
				{options.map(([v, l]) => (
					<option key={v} value={v}>
						{l}
					</option>
				))}
			</select>
		</label>
	);
}

export default CompanyReviewSubmissionPage;
