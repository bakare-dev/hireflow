import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchEventSource,
	EventStreamContentType,
} from "@microsoft/fetch-event-source";
import { applicationsApi } from "../api/applicationsApi";
import { selectAuthStatus, selectAuthUser } from "../store/slices/authSlice";
import { USER_ROLES } from "../constants/roles";
import { STAGE_LABELS } from "../constants/stages";
import { getStoredToken } from "../utils/http";
import useToast from "./useToast";

const NOTIFICATION_BASE_URL = import.meta.env.VITE_NOTIFICATION_BASE_URL ?? "";

class FatalError extends Error {}

function useApplicationStream() {
	const dispatch = useDispatch();
	const toast = useToast();
	const status = useSelector(selectAuthStatus);
	const user = useSelector(selectAuthUser);

	const applicantId = user?.id ?? null;
	const role = user?.role ?? null;

	useEffect(() => {
		if (status !== "authenticated") return undefined;
		if (role !== USER_ROLES.APPLICANT) return undefined;
		if (!applicantId) return undefined;
		if (!NOTIFICATION_BASE_URL) {
			if (import.meta.env.DEV) {
				console.warn(
					"[notifications] VITE_NOTIFICATION_BASE_URL is not set; SSE stream disabled.",
				);
			}
			return undefined;
		}

		const ctrl = new AbortController();
		const url = `${NOTIFICATION_BASE_URL.replace(/\/+$/, "")}/api/v1/notifications/stream/${applicantId}`;

		fetchEventSource(url, {
			signal: ctrl.signal,
			openWhenHidden: true,
			headers: (() => {
				const token = getStoredToken();
				return token ? { Authorization: `Bearer ${token}` } : {};
			})(),
			async onopen(response) {
				const contentType = response.headers.get("content-type") ?? "";
				if (
					response.ok &&
					contentType.includes(EventStreamContentType)
				) {
					return;
				}
				if (response.status === 401 || response.status === 403) {
					throw new FatalError(
						`SSE auth failed (${response.status})`,
					);
				}
				throw new Error(
					`Unexpected SSE response: ${response.status} ${contentType}`,
				);
			},
			onmessage(ev) {
				if (!ev.event) return;
				if (ev.event === "connected") return;
				if (ev.event === "application-stage-updated") {
					let payload;
					try {
						payload = JSON.parse(ev.data);
					} catch {
						return;
					}
					handleStageUpdate(payload, { dispatch, toast });
				}
			},
			onerror(err) {
				if (err instanceof FatalError) {
					throw err;
				}
				if (import.meta.env.DEV) {
					console.warn("[notifications] SSE error", err);
				}
			},
		}).catch((err) => {
			if (err instanceof FatalError) return;
			if (err?.name === "AbortError") return;
			if (import.meta.env.DEV) {
				console.warn("[notifications] SSE closed", err);
			}
		});

		return () => ctrl.abort();
	}, [status, role, applicantId, dispatch, toast]);
}

function stageLabel(stage) {
	if (!stage) return null;
	return STAGE_LABELS[stage] ?? stage;
}

function handleStageUpdate(payload, { dispatch, toast }) {
	const { applicationId, jobTitle, previousStage, currentStage, message } =
		payload ?? {};

	const from = stageLabel(previousStage);
	const to = stageLabel(currentStage);
	const headline =
		jobTitle && to
			? from
				? `${jobTitle}: ${from} → ${to}`
				: `${jobTitle}: ${to}`
			: "Application updated";

	toast.info(message ? `${headline} — ${message}` : headline);

	const tags = [{ type: "Applications", id: "LIST" }, "Applications"];
	if (applicationId) tags.push({ type: "Applications", id: applicationId });
	dispatch(applicationsApi.util.invalidateTags(tags));
}

export default useApplicationStream;
