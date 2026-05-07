export function simulateLatency(ms = 200 + Math.random() * 300) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
