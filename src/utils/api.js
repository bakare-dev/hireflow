import { USER_ROLES } from "../constants/roles";

export function normalizeApiRole(role) {
	if (role === "HMANAGER") return USER_ROLES.HIRING_MANAGER;
	return role;
}

export function displayNameFromEmail(email) {
	return email
		?.split("@")[0]
		?.split(/[._-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function toAuthUser(auth) {
	return {
		id: auth.userId,
		email: auth.email,
		name: displayNameFromEmail(auth.email) ?? "Signed-in user",
		role: normalizeApiRole(auth.role),
		token: auth.token,
	};
}

export function toRegistrationPayload(input, selectedRole) {
	return {
		firstName: input.firstName?.trim(),
		lastName: input.lastName?.trim(),
		email: input.email?.trim(),
		password: input.password,
		role:
			selectedRole === "RECRUITER"
				? USER_ROLES.ADMIN
				: USER_ROLES.APPLICANT,
	};
}

export function toRtkError(err) {
	return {
		status: err.status ?? "CUSTOM_ERROR",
		data: err.response ?? err.data ?? null,
		error: err.message ?? "Request failed",
	};
}
