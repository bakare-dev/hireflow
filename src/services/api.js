import {
	buildUrl,
	createHeaders,
	messageFromBody,
	normalizeSuccess,
	parseResponse,
} from "../utils/http";

export { setAuthToken } from "../utils/http";

export class ApiError extends Error {
	constructor({ message, status, data, response }) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
		this.response = response;
	}
}

async function request(method, path, options = {}) {
	const {
		payload,
		params,
		headers,
		auth = true,
		token,
		signal,
		returnEnvelope = false,
		...fetchOptions
	} = options;
	const hasBody = payload !== undefined && method !== "GET";
	const body =
		hasBody &&
		typeof FormData !== "undefined" &&
		payload instanceof FormData
			? payload
			: hasBody
				? JSON.stringify(payload)
				: undefined;

	let response;
	let responseBody;

	try {
		response = await fetch(buildUrl(path, params), {
			method,
			headers: createHeaders({ headers, payload, auth, token }),
			body,
			signal,
			...fetchOptions,
		});
		responseBody = await parseResponse(response);
	} catch (err) {
		throw new ApiError({
			message: err.message || "Network request failed",
			status: 0,
			data: null,
			response: null,
		});
	}

	const apiSucceeded =
		responseBody &&
		typeof responseBody === "object" &&
		"success" in responseBody
			? responseBody.success
			: response.ok;

	if (!response.ok || !apiSucceeded) {
		throw new ApiError({
			message: messageFromBody(
				responseBody,
				`Request failed with status ${response.status}`,
			),
			status: response.status,
			data: responseBody?.data ?? null,
			response: responseBody,
		});
	}

	return returnEnvelope ? responseBody : normalizeSuccess(responseBody);
}

export const apiHandler = Object.freeze({
	get: (path, options) => request("GET", path, options),
	post: (path, options) => request("POST", path, options),
	put: (path, options) => request("PUT", path, options),
	patch: (path, options) => request("PATCH", path, options),
	delete: (path, options) => request("DELETE", path, options),
	request,
});

export async function apiRequest(path, options = {}) {
	return request(options.method ?? "GET", path, {
		...options,
		payload: options.body ?? options.payload,
	});
}
