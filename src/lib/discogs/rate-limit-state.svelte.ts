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

	updateFromHeaders(headers: Headers): void {
		this.rateLimit = parseRateLimitHeaders(headers);
	}
}

export const discogsRateLimit = new DiscogsRateLimitState();
