import * as discogs from './client';
import { parseRateLimitHeaders } from './rate-limit';

import type { RateLimitInfo, SearchResult, SearchType } from './types';

class DiscogsApi {
	rateLimit = $state<RateLimitInfo>({ limit: null, used: null, remaining: null });
	error = $state<string | null>(null);
	searchQuery = $state('');
	searchType = $state<SearchType | ''>('');
	searching = $state(false);
	searchResults = $state<SearchResult[]>([]);

	get isRateLimited(): boolean {
		return this.rateLimit.remaining !== null && this.rateLimit.remaining <= 0;
	}

	update(info: RateLimitInfo): void {
		this.rateLimit = info;
	}

	updateFromHeaders(headers: Headers): void {
		this.update(parseRateLimitHeaders(headers));
	}

	setError(message: string | null): void {
		this.error = message;
	}

	clearError(): void {
		this.error = null;
	}

	clearSearchResults(): void {
		this.searchResults = [];
	}

	clear(): void {
		this.clearError();
		this.clearSearchResults();
	}

	async withRequest<T>(fn: () => Promise<T>, errorMessage: string): Promise<T | null> {
		this.clearError();

		try {
			return await fn();
		} catch (err) {
			this.setError(err instanceof Error ? err.message : errorMessage);
			return null;
		}
	}

	async search(query: string, type?: SearchType): Promise<SearchResult[]> {
		const trimmed = query.trim();

		if (!trimmed || this.searching || this.isRateLimited) return [];

		this.searchQuery = trimmed;
		this.searchType = type ?? '';
		this.searching = true;

		try {
			const response = await discogs.search(trimmed, type);

			this.searchResults = response.results;

			return response.results;
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Search failed');
			this.searchResults = [];

			return [];
		} finally {
			this.searching = false;
		}
	}
}

export const discogsApi = new DiscogsApi();
