import { dev } from '$app/environment';

import type { RateLimitInfo } from './types';

const MAX_REQUESTS_PER_MINUTE = dev ? 55 : 25;
const WINDOW_MS = 60_000;

const timestamps: number[] = [];

function pruneTimestamps(now: number): void {
	while (timestamps.length > 0 && now - timestamps[0]! >= WINDOW_MS) {
		timestamps.shift();
	}
}

export function getClientRateLimit(): RateLimitInfo {
	const now = Date.now();
	pruneTimestamps(now);

	const used = timestamps.length;

	return {
		limit: MAX_REQUESTS_PER_MINUTE,
		used,
		remaining: MAX_REQUESTS_PER_MINUTE - used
	};
}

export async function acquireRateLimitSlot(): Promise<void> {
	while (true) {
		const now = Date.now();
		pruneTimestamps(now);

		if (timestamps.length < MAX_REQUESTS_PER_MINUTE) {
			timestamps.push(now);
			return;
		}

		const waitMs = WINDOW_MS - (now - timestamps[0]!) + 100;
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}
}
