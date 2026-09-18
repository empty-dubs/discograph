import { dev } from '$app/environment';

import type { RateLimitInfo } from './types';

const MAX_REQUESTS_PER_MINUTE = dev ? 55 : 25;
const SLOT_RELEASE_BUFFER_MS = 50;
const WINDOW_MS = 60_000;

const requestTimestamps: number[] = [];

function pruneTimestamps(now: number): void {
	while (requestTimestamps.length > 0 && (now - requestTimestamps[0]!) >= WINDOW_MS) {
		requestTimestamps.shift();
	}
}

export function getClientRateLimit(now = Date.now()): RateLimitInfo {
	pruneTimestamps(now);

	const used = requestTimestamps.length;

	return {
		limit: MAX_REQUESTS_PER_MINUTE,
		used,
		remaining: MAX_REQUESTS_PER_MINUTE - used,
		queueClearTimeMs:
			requestTimestamps.length === 0
				? null
				: WINDOW_MS - (now - requestTimestamps[0]!) + SLOT_RELEASE_BUFFER_MS
	};
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
	}
}

let lastCrawlRequestAt = 0;

export async function awaitFetchRequestSlot(): Promise<void> {
	const delayMs = Math.ceil(WINDOW_MS / MAX_REQUESTS_PER_MINUTE);
	const elapsed = Date.now() - lastCrawlRequestAt;

	if (lastCrawlRequestAt > 0 && elapsed < delayMs) {
		await new Promise((resolve) => setTimeout(resolve, delayMs - elapsed));
	}

	lastCrawlRequestAt = Date.now();
}
