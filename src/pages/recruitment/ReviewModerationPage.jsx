import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/common/Button";
import Card, { CardBody, CardHeader } from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import {
	applyReviewModeration,
	fetchModerationQueue,
	selectModerationQueue,
} from "../../store/slices/companyReviewsSlice";
import useToast from "../../hooks/useToast";
import { formatDateTime } from "../../utils/date";

function ReviewModerationPage() {
	const dispatch = useDispatch();
	const toast = useToast();
	const queue = useSelector(selectModerationQueue);

	useEffect(() => {
		dispatch(fetchModerationQueue());
	}, [dispatch]);

	async function moderate(reviewId, status) {
		const action = await dispatch(applyReviewModeration({ reviewId, status }));
		if (applyReviewModeration.fulfilled.match(action)) {
			toast.success(`Review ${status.toLowerCase()}.`);
		} else {
			toast.error(action.error?.message ?? "Unable to apply moderation.");
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				eyebrow="Administration"
				title="Review Moderation Queue"
				description="Moderate flagged, pending, or suspicious company reviews before public visibility."
			/>
			<Card>
				<CardHeader>
					<h2 className="text-sm font-semibold text-slate-900">Pending Reviews</h2>
				</CardHeader>
				<CardBody className="space-y-3">
					{queue.length ? (
						queue.map((review) => (
							<div key={review.id} className="rounded-lg border border-slate-200 p-4">
								<div className="mb-2 flex items-center justify-between">
									<p className="font-medium text-slate-900">
										{review.anonymous ? "Anonymous Candidate" : review.authorUserId}
									</p>
									<p className="text-xs text-slate-500">
										{formatDateTime(review.createdAt)}
									</p>
								</div>
								<p className="text-sm text-slate-700">{review.positiveExperience}</p>
								<p className="text-sm text-slate-700">{review.negativeExperience}</p>
								<div className="mt-3 flex gap-2">
									<Button size="sm" onClick={() => moderate(review.id, "APPROVED")}>
										Approve
									</Button>
									<Button
										size="sm"
										variant="danger"
										onClick={() => moderate(review.id, "REJECTED")}
									>
										Reject
									</Button>
								</div>
							</div>
						))
					) : (
						<p className="text-sm text-slate-600">No reviews pending moderation.</p>
					)}
				</CardBody>
			</Card>
		</div>
	);
}

export default ReviewModerationPage;
