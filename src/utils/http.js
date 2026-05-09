const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN_STORAGE_KEY = "hireflow.token";

export function getStoredToken() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(TOKEN_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function setAuthToken(token) {
	if (typeof window === "undefined") return;
	try {
		if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
		else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
	} catch {
		return;
	}
}

export function buildUrl(path, params) {
	const origin =
		typeof window === "undefined"
			? "http://localhost"
			: window.location.origin;
	const baseUrl = API_BASE_URL || origin;
	const url = /^https?:\/\//i.test(path)
		? new URL(path)
		: new URL(path.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);

	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (value === undefined || value === null || value === "") return;
			if (Array.isArray(value)) {
				value.forEach((item) => url.searchParams.append(key, item));
				return;
			}
			url.searchParams.set(key, value);
		});
	}

	if (!API_BASE_URL) return `${url.pathname}${url.search}${url.hash}`;
	return url.toString();
}

export function isJsonResponse(response) {
	return response.headers
		.get("content-type")
		?.toLowerCase()
		.includes("application/json");
}

export async function parseResponse(response) {
	if (response.status === 204) return null;
	if (isJsonResponse(response)) return response.json();
	return response.text();
}

export function createHeaders({ headers, payload, auth, token }) {
	const nextHeaders = new Headers(headers);
	const isFormData =
		typeof FormData !== "undefined" && payload instanceof FormData;

	if (
		payload !== undefined &&
		!isFormData &&
		!nextHeaders.has("Content-Type")
	) {
		nextHeaders.set("Content-Type", "application/json");
	}

	if (auth !== false && !nextHeaders.has("Authorization")) {
		const stored = token || getStoredToken();
		if (stored) nextHeaders.set("Authorization", `Bearer ${stored}`);
	}

	return nextHeaders;
}

export function normalizeSuccess(body) {
	if (body && typeof body === "object" && "success" in body) {
		return body.data ?? null;
	}
	return body;
}

export function messageFromBody(body, fallback) {
	if (body && typeof body === "object" && typeof body.message === "string") {
		return body.message;
	}
	if (typeof body === "string" && body.trim()) return body;
	return fallback;
}
