import { getClientRateLimit } from './rate-limiter';

import type { RateLimitInfo } from './types';

class DiscogsRateLimitState {
	rateLimit = $state<RateLimitInfo>({
		limit: null,
		used: null,
		remaining: null,
		queueClearTimeMs: null
	});

	private refreshTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	get isRateLimited(): boolean {
		return this.rateLimit.remaining !== null && this.rateLimit.remaining <= 0;
	}

	scheduleRefresh(): void {
		if (this.refreshTimeout !== undefined) {
			clearTimeout(this.refreshTimeout);
			this.refreshTimeout = undefined;
		}

		this.rateLimit = getClientRateLimit();

		const refreshDelayMs = this.rateLimit.queueClearTimeMs;

		if (refreshDelayMs === null) return;

		this.refreshTimeout = setTimeout(() => this.scheduleRefresh(), refreshDelayMs);
	}
}

export const discogsRateLimit = new DiscogsRateLimitState();

// initial rate limitrefresh
discogsRateLimit.scheduleRefresh();
