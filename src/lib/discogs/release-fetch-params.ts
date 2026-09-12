import { controlPanelSettings } from '$lib/graph/stores/ControlPanelSettingsState.svelte';

import type { PagedListParams } from './client';

export function artistReleaseFetchParams(page: number): PagedListParams {
	return {
		page,
		per_page: controlPanelSettings.fetchCount,
		sort: controlPanelSettings.fetchOrder
	};
}

export function labelReleaseFetchParams(page: number): PagedListParams {
	// Label releases API supports page/per_page only — no server-side sort.
	return {
		page,
		per_page: controlPanelSettings.fetchCount
	};
}

export function masterVersionFetchParams(page: number): PagedListParams {
	const sort = controlPanelSettings.fetchOrder === 'year' ? 'released' : 'title';

	return {
		page,
		per_page: controlPanelSettings.fetchCount,
		sort
	};
}
