import { dev } from '$app/environment';

const MAX_REQUESTS_PER_MINUTE = dev ? 55 : 20;
const SLOT_RELEASE_BUFFER_MS = 50;
const WINDOW_MS = 60_000;

const requestTimestamps: number[] = [];

function pruneTimestamps(now: number): void {
	while (requestTimestamps.length > 0 && now - requestTimestamps[0]! >= WINDOW_MS) {
		requestTimestamps.shift();
	}
}

export async function acquireRateLimitSlot(now = Date.now()): Promise<void> {
	while (true) {
		pruneTimestamps(now);

		if (requestTimestamps.length < MAX_REQUESTS_PER_MINUTE) {
			requestTimestamps.push(now);

			return;
		}

		const waitMs = WINDOW_MS - (now - requestTimestamps[0]!) + 2 * SLOT_RELEASE_BUFFER_MS;

		await new Promise((resolve) => setTimeout(resolve, waitMs));

		now = Date.now();
	}
}
