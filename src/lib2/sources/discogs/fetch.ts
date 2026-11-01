import { isBlocked } from './blocked';
import { getArtist, getLabel, getRelease, getMaster } from './client';
import { getEntityId } from './compositions';
import { documentStore } from './stores/documents.svelte';
import { fetchError } from './stores/fetch-error.svelte';
import { fetchStatus } from './stores/fetch-statuses.svelte';

import type { EntityDocumentPayload, EntityType, PagedListParams } from './types';

type FetchMethod = (id: number) => Promise<EntityDocumentPayload>;

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

export async function fetchEntityDocument(entityExternalId: number, entityType: EntityType): Promise<EntityDocumentPayload | null> {
	const fetch = FETCH_METHOD[entityType];

	if (!fetch) return null;
	
	const entityId = getEntityId(entityType, entityExternalId);

	if (isBlocked(entityType, entityExternalId)) {
		fetchStatus.set(entityId, 'loaded');

		return null;
	}

	const status = fetchStatus.get(entityId);

	if (status === 'loading' || status === 'loaded' || status === 'failed') return null;

	fetchStatus.set(entityId, 'loading');

	const payload = await fetch(entityExternalId);

	if (!payload) {
		fetchStatus.set(entityId, 'failed');

		return null;
	}

	documentStore.set(entityId, payload);

	fetchStatus.set(entityId, 'loaded');

	return payload;
}

export async function withFetch<T>(
	fn: () => Promise<T>,
	errorMessage: string
): Promise<T | null> {
	fetchError.clear();

	try {
		return await fn();
	} catch (err) {
		fetchError.set(err instanceof Error ? err.message : errorMessage);

		return null;
	}
}
