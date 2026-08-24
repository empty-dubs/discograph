import { dev } from '$app/environment';

import { getClientRateLimit } from './rate-limiter';

import type { RateLimitInfo } from './types';

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
	const limit = headers.get('x-discogs-ratelimit');
	const used = headers.get('x-discogs-ratelimit-used');
	const remaining = headers.get('x-discogs-ratelimit-remaining');

	return {
		limit: limit ? Number(limit) : null,
		used: used ? Number(used) : null,
		remaining: remaining ? Number(remaining) : null
	};
}

class DiscogsRateLimitState {
	rateLimit = $state<RateLimitInfo>({ limit: null, used: null, remaining: null });

	get isRateLimited(): boolean {
		return this.rateLimit.remaining !== null && this.rateLimit.remaining <= 0;
	}

	updateFromClient(info: RateLimitInfo): void {
		this.rateLimit = info;
	}

	updateFromHeaders(headers: Headers): void {
		const fromHeaders = parseRateLimitHeaders(headers);

		if (fromHeaders.limit !== null && fromHeaders.remaining !== null) {
			this.rateLimit = fromHeaders;
		}
	}
}

export const discogsRateLimit = new DiscogsRateLimitState();

if (!dev) {
	discogsRateLimit.updateFromClient(getClientRateLimit());
}
