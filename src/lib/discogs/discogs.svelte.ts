import { search as searchClient } from './client';
import { BLOCKED_DISCOGS_IDS } from './constants';
import { discogsRateLimit } from './rate-limit-state.svelte';

import type { SearchResult, SearchType } from './types';

class DiscogsApi {
	error = $state<string | null>(null);
	searchQuery = $state('');
	searchType = $state<SearchType | ''>('');
	searching = $state(false);
	searchResults = $state<SearchResult[]>([]);

	get rateLimit() {
		return discogsRateLimit.rateLimit;
	}

	get isRateLimited(): boolean {
		return discogsRateLimit.isRateLimited;
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

	clearSearch(): void {
		this.clearError();
		this.searchQuery = '';
		this.clearSearchResults();
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

	async search(query: string, type?: SearchType) {
		const trimmed = query.trim();

		if (!trimmed || this.searching || this.isRateLimited) return;

		this.searchQuery = trimmed;
		this.searchType = type ?? '';
		this.searching = true;

		try {
			const response = await searchClient(trimmed, type);

			this.searchResults = response.results;
		} catch (err) {
			this.setError(err instanceof Error ? err.message : 'Search failed');
			this.searchResults = [];

			return;
		} finally {
			this.searching = false;
		}
	}

	isBlockedDiscogsEntity(type: SearchType, discogsId: number | null): boolean {
		if (discogsId === null) return false;

		return BLOCKED_DISCOGS_IDS[type]?.has(discogsId) ?? false;
	}
}

export const discogsApi = new DiscogsApi();
