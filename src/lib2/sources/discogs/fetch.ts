import { getArtist, getLabel, getRelease, getMaster } from './client';
import { getEntityId } from './compositions';
import { documentStore } from './document-store.svelte';

import type { EntityType, PagedListParams } from './types';

type FetchMethod = (id: number) => Promise<unknown>;

const DEFAULT_PER_PAGE = 50;

const FETCH_METHOD: Record<EntityType, FetchMethod> = {
	artist: (id) => getArtist(id),
	label: (id) => getLabel(id),
	release: (id) => getRelease(id),
	master: (id) => getMaster(id)
};

const FETCH_ERROR_MESSAGE: Record<EntityType, string> = {
	artist: 'Failed to load artist details',
	label: 'Failed to load label details',
	release: 'Failed to load release details',
	master: 'Failed to load master details'
};

export function artistReleaseFetchParams(page: number): PagedListParams {
	return {
		page,
		per_page: DEFAULT_PER_PAGE,
		sort: 'year'
	};
}

export function labelReleaseFetchParams(page: number): PagedListParams {
	return {
		page,
		per_page: DEFAULT_PER_PAGE
	};
}

export function masterVersionFetchParams(page: number): PagedListParams {
	return {
		page,
		per_page: DEFAULT_PER_PAGE,
		sort: 'released'
	};
}

export function entityFetchErrorMessage(type: EntityType): string {
	return FETCH_ERROR_MESSAGE[type] ?? 'Failed to load document';
}

export async function fetchEntityDocument(entityExternalId: number, entityType: EntityType): Promise<unknown | null> {
	const fetch = FETCH_METHOD[entityType];

	if (!fetch) return null;

	const payload = await fetch(entityExternalId);

    const entityId = getEntityId(entityType, entityExternalId);

	documentStore.set(entityId, payload);

	return payload;
}
