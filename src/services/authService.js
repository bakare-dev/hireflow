import { db } from "./db";
import { simulateLatency } from "../utils/async";
import { newId } from "../utils/id";
import { nowIso } from "../utils/date";
import { USER_ROLES } from "../constants/roles";
import {
	DEFAULT_AUTO_PASS_THRESHOLD,
	DEFAULT_AUTO_REJECT_THRESHOLD,
} from "../constants/screening";

export async function listUsers() {
	await simulateLatency();
	return db.users.map((u) => ({ ...u }));
}

export async function getUserById(id) {
	await simulateLatency();
	const user = db.users.find((u) => u.id === id);
	if (!user) throw new Error(`User not found: ${id}`);
	return { ...user };
}

export async function loginAs(userId) {
	return getUserById(userId);
}

export async function signInWithEmail({ email, password }) {
	await simulateLatency();
	if (!email?.trim() || !password) {
		const err = new Error("Email and password are required.");
		err.code = "INVALID_CREDENTIALS";
		throw err;
	}
	const normalized = email.trim().toLowerCase();
	const user = db.users.find((u) => u.email.toLowerCase() === normalized);
	if (!user) {
		const err = new Error("No account found for that email.");
		err.code = "USER_NOT_FOUND";
		throw err;
	}
	return { ...user };
}

export async function getCompany(companyId) {
	await simulateLatency();
	const company = db.companies.find((c) => c.id === companyId);
	if (!company) throw new Error(`Company not found: ${companyId}`);
	return { ...company };
}

function ensureEmailAvailable(email) {
	const taken = db.users.some(
		(u) => u.email.toLowerCase() === email.toLowerCase(),
	);
	if (taken) {
		const err = new Error("An account with that email already exists.");
		err.code = "EMAIL_TAKEN";
		throw err;
	}
}

export async function signUpApplicant({
	name,
	email,
	password,
	location,
	skills,
}) {
	await simulateLatency();
	if (!name?.trim() || !email?.trim() || !password) {
		throw new Error("Missing required fields.");
	}
	ensureEmailAvailable(email);

	const fallbackCompanyId = db.companies[0]?.id ?? "co_orphan";

	const user = {
		id: newId("user"),
		name: name.trim(),
		email: email.trim(),
		role: USER_ROLES.APPLICANT,
		companyId: fallbackCompanyId,
		avatarUrl: null,
		resumeUrl: null,
		skills: skills ?? [],
		location: location ?? null,
		createdAt: nowIso(),
	};
	db.users.push(user);
	return { ...user };
}

export async function signUpRecruiter({
	name,
	email,
	password,
	companyName,
	companyWebsite,
	companySize,
}) {
	await simulateLatency();
	if (!name?.trim() || !email?.trim() || !password || !companyName?.trim()) {
		throw new Error("Missing required fields.");
	}
	ensureEmailAvailable(email);

	const company = {
		id: newId("co"),
		name: companyName.trim(),
		logoUrl: null,
		website: companyWebsite ?? null,
		size: companySize ?? null,
		autoPassThreshold: DEFAULT_AUTO_PASS_THRESHOLD,
		autoRejectThreshold: DEFAULT_AUTO_REJECT_THRESHOLD,
	};
	db.companies.push(company);

	const user = {
		id: newId("user"),
		name: name.trim(),
		email: email.trim(),
		role: USER_ROLES.ADMIN,
		companyId: company.id,
		avatarUrl: null,
		createdAt: nowIso(),
	};
	db.users.push(user);
	return { ...user };
}

const OTP_LENGTH = 6;

export async function requestOtp() {
	await simulateLatency();
	return { sent: true };
}

export async function verifyOtp(_email, code) {
	await simulateLatency();
	if (
		typeof code !== "string" ||
		!/^\d+$/.test(code) ||
		code.length !== OTP_LENGTH
	) {
		const err = new Error(`Enter the ${OTP_LENGTH}-digit code we sent.`);
		err.code = "INVALID_OTP";
		throw err;
	}
	return { verified: true };
}

export async function requestPasswordReset(email) {
	await simulateLatency();
	if (!email?.trim()) {
		throw new Error("Email is required.");
	}
	const normalized = email.trim().toLowerCase();
	const exists = db.users.some((u) => u.email.toLowerCase() === normalized);
	return { sent: true, exists };
}

export async function resetPassword({ email, code, newPassword }) {
	await simulateLatency();
	await verifyOtp(email, code);
	if (typeof newPassword !== "string" || newPassword.length < 8) {
		const err = new Error("Password must be at least 8 characters.");
		err.code = "WEAK_PASSWORD";
		throw err;
	}
	return { ok: true };
}
