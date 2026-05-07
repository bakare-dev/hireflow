import { useEffect } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "../../components/common/EmptyState";
import StageBadge from "../../components/domain/StageBadge";
import { ROUTES } from "../../constants/routes";
import { STAGE_LABELS } from "../../constants/stages";
import { selectAuthUser } from "../../store/slices/authSlice";
import {
	fetchNotifications,
	selectNotifications,
} from "../../store/slices/notificationsSlice";
import { formatDateTime } from "../../utils/date";

function Messages() {
	const dispatch = useDispatch();
	const user = useSelector(selectAuthUser);
	const notifications = useSelector(selectNotifications);

	useEffect(() => {
		if (user?.id) dispatch(fetchNotifications(user.id));
	}, [dispatch, user?.id]);

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm font-medium text-slate-500">Messages</p>
				<h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
					Recruiter updates, without the noise.
				</h1>
			</div>

			<section className="rounded-xl border border-slate-200 bg-white shadow-sm">
				{notifications.length ? (
					<div className="divide-y divide-slate-100">
						{notifications.map((notification) => (
							<Link
								key={notification.id}
								to={ROUTES.APPLICANT_APPLICATION(notification.applicationId)}
								className="block p-5 transition hover:bg-slate-50"
							>
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p className="text-lg font-semibold text-slate-950">
											{notification.subject}
										</p>
										<p className="mt-1 text-sm leading-6 text-slate-600">
											{notification.body}
										</p>
									</div>
									<StageBadge stage={notification.currentStage} />
								</div>
								<div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
									<span>{formatDateTime(notification.sentAt)}</span>
									<span>
										Next:{" "}
										{notification.nextStage
											? STAGE_LABELS[notification.nextStage]
											: "Complete"}
									</span>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div className="p-6">
						<EmptyState
							title="No messages yet"
							description="Application updates and interview messages will appear here."
						/>
					</div>
				)}
			</section>
		</div>
	);
}

export default Messages;
