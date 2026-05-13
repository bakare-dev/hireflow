import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyProfileQuery } from "../api/usersApi";
import {
	selectAuthStatus,
	selectAuthUser,
	setAuthenticatedUser,
} from "../store/slices/authSlice";
import { normalizeApiRole } from "../utils/api";

/**
 * Calls `GET /api/v1/users/me` whenever there's an authenticated session and
 * folds the response into the redux auth user so Topbar / Sidebar / pages all
 * see real `firstName`, `lastName`, `companyId`, `companyName`, and a `name`
 * derived from the actual profile (instead of the email-prefix fallback that
 * the login response can only give us).
 */
function useSyncMyProfile() {
	const dispatch = useDispatch();
	const status = useSelector(selectAuthStatus);
	const user = useSelector(selectAuthUser);
	const { data } = useGetMyProfileQuery(undefined, {
		skip: status !== "authenticated" || !user,
	});

	useEffect(() => {
		if (!data || !user) return;
		const name =
			[data.firstName, data.lastName].filter(Boolean).join(" ") ||
			user.name;
		const next = {
			...user,
			id: data.id ?? user.id,
			email: data.email ?? user.email,
			firstName: data.firstName ?? user.firstName ?? null,
			lastName: data.lastName ?? user.lastName ?? null,
			name,
			role: normalizeApiRole(data.role) ?? user.role,
			companyId: data.companyId ?? null,
			companyName: data.companyName ?? null,
			verified: data.verified ?? user.verified ?? null,
		};
		const keys = [
			"id",
			"email",
			"firstName",
			"lastName",
			"name",
			"role",
			"companyId",
			"companyName",
			"verified",
		];
		const changed = keys.some((k) => next[k] !== user[k]);
		if (changed) dispatch(setAuthenticatedUser(next));
	}, [data, user, dispatch]);
}

export default useSyncMyProfile;
