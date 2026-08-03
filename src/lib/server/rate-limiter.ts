const MAX_REQUESTS_PER_MINUTE = 55;
const WINDOW_MS = 60_000;

const timestamps: number[] = [];

export async function acquireRateLimitSlot(): Promise<void> {
	while (true) {
		const now = Date.now();
		while (timestamps.length > 0 && now - timestamps[0]! >= WINDOW_MS) {
			timestamps.shift();
		}

		if (timestamps.length < MAX_REQUESTS_PER_MINUTE) {
			timestamps.push(now);
			return;
		}

		const waitMs = WINDOW_MS - (now - timestamps[0]!) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}
}
