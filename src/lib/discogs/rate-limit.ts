import type { RateLimitInfo } from './types';

export function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
	const limit = headers.get('x-discogs-ratelimit');
	const used = headers.get('x-discogs-ratelimit-used');
	const remaining = headers.get('x-discogs-ratelimit-remaining');

	return {
		limit: limit ? Number(limit) : null,
		used: used ? Number(used) : null,
		remaining: remaining ? Number(remaining) : null
	};
}
