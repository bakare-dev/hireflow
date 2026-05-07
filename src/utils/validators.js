export function isValidUrl(value) {
	if (typeof value !== "string" || !value.trim()) return false;
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

export function isMeetLink(value) {
	return isValidUrl(value);
}

export function isNonEmpty(value) {
	return typeof value === "string" && value.trim().length > 0;
}
