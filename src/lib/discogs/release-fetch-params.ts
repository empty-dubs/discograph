import FetchSettingsState from '$lib/stores/FetchSettingsState.svelte';

import type { PagedListParams } from './client';

export function artistReleaseFetchParams(page: number): PagedListParams {
	return {
		page,
		per_page: FetchSettingsState.fetchCount,
		sort: FetchSettingsState.fetchOrder
	};
}

export function labelReleaseFetchParams(page: number): PagedListParams {
	// Label releases API supports page/per_page only — no server-side sort.
	return {
		page,
		per_page: FetchSettingsState.fetchCount
	};
}

export function masterVersionFetchParams(page: number): PagedListParams {
	const sort = FetchSettingsState.fetchOrder === 'year' ? 'released' : 'title';

	return {
		page,
		per_page: FetchSettingsState.fetchCount,
		sort
	};
}
