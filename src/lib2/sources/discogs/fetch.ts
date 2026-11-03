import {
	getArtist,
	getArtistReleases,
	getLabel,
	getLabelReleases,
	getMaster,
	getMasterVersions,
	getRelease
} from './client';
import { BLOCKED_DISCOGS_IDS } from './constants';
import { getEntityId } from './compositions';

import { documentStore } from './stores/documents.svelte';
import { fetchError } from './stores/fetch-error.svelte';
import { fetchStatus } from './stores/fetch-statuses.svelte';
import { pagedDocumentStore } from './stores/paged-documents.svelte';
import { releasesStore } from './stores/releases.svelte';

import type {
	EntityDocument,
	EntityType,
	LoadType,
	Master,
	PagedDocument,
	PagedFetchParams,
	Release
} from './types';

type DocumentFetchMethod = (id: number) => Promise<EntityDocument>;
type PagedDocumentFetchMethod = (id: number, params: PagedFetchParams) => Promise<PagedDocument>;
type PagedDocumentFetchParams = (page: number) => PagedFetchParams;

const DEFAULT_PER_PAGE = 50;

const DOCUMENT_FETCH_METHOD: Record<EntityType, DocumentFetchMethod> = {
	artist: (id) => getArtist(id),
	label: (id) => getLabel(id),
	master: (id) => getMaster(id),
	release: (id) => getRelease(id)
};

const PAGED_DOCUMENT_FETCH_METHOD: Partial<Record<EntityType, PagedDocumentFetchMethod>> = {
	artist: (id, params) => getArtistReleases(id, params),
	label: (id, params) => getLabelReleases(id, params),
	master: (id, params) => getMasterVersions(id, params)
}

const DOCUMENT_FETCH_ERROR_MESSAGE: Record<EntityType, string> = {
	artist: 'Failed to load artist details',
	label: 'Failed to load label details',
	master: 'Failed to load master details',
	release: 'Failed to load release details'
};

const PAGED_DOCUMENT_FETCH_ERROR_MESSAGE: Partial<Record<EntityType, string>> = {
	artist: 'Failed to load artist releases',
	label: 'Failed to load label releases',
	master: 'Failed to load master versions'
};

const PAGED_DOCUMENT_FETCH_PARAMS: Partial<Record<EntityType, PagedDocumentFetchParams>> = {
	artist: (page) => ({
		page,
		per_page: DEFAULT_PER_PAGE,
		sort: 'year'
	}),
	label: (page) => ({
		page,
		per_page: DEFAULT_PER_PAGE
	}),
	master: (page) => ({
		page,
		per_page: DEFAULT_PER_PAGE,
		sort: 'released'
	}),
};

export function isBlocked(type: EntityType, id: number): boolean {
	return BLOCKED_DISCOGS_IDS[type]?.has(id) ?? true;
}

export async function fetchEntityDocument(entityExternalId: number, entityType: EntityType): Promise<EntityDocument | undefined> {
	const fetch = DOCUMENT_FETCH_METHOD[entityType];

	if (!fetch) return;
	
	const entityId = getEntityId(entityType, entityExternalId);

	if (isBlocked(entityType, entityExternalId)) {
		fetchStatus.set(entityId, 'loaded');

		return;
	}

	const status = fetchStatus.get(entityId);

	if (status === 'loading' || status === 'loaded') return;

	fetchStatus.set(entityId, 'loading');

	try {
		const payload = await fetch(entityExternalId);

		if (!payload) return;

		documentStore.set(entityId, payload);
		fetchStatus.set(entityId, 'loaded');

		return payload;
	} catch (err) {
		const errorMessage = DOCUMENT_FETCH_ERROR_MESSAGE[entityType] ?? 'Failed to load document';

		fetchStatus.set(entityId, 'failed');
		fetchError.set(err instanceof Error ? err.message : errorMessage);

		return;
	}
}

export async function fetchPagedDocument(
	entityType: EntityType,
	entityExternalId: number,
	loadType: LoadType
): Promise<PagedDocument | undefined> {
	const fetch = PAGED_DOCUMENT_FETCH_METHOD[entityType];
	const params = PAGED_DOCUMENT_FETCH_PARAMS[entityType];

	if (!fetch || !params || isBlocked(entityType, entityExternalId)) return;

	const entityId = getEntityId(entityType, entityExternalId);

	let page: number;

	const pagedDocument = pagedDocumentStore.get(entityId, loadType);

	if (!pagedDocument) {
		page = 1;
	} else {
		if (pagedDocument.pagination.page >= pagedDocument.pagination.pages) return;

		page = pagedDocument.pagination.page + 1;
	}

	try {
		const payload = await fetch(entityExternalId, params(page));

		if (!payload) return;

		pagedDocumentStore.set(entityId, payload, loadType);
		releasesStore.set(entityId, payload, loadType, entityType);

		return payload;
	} catch (err) {
		const errorMessage = PAGED_DOCUMENT_FETCH_ERROR_MESSAGE[entityType] ?? 'Failed to load releases';

		fetchError.set(err instanceof Error ? err.message : errorMessage);

		return;
	}
}

export async function fetchMainReleaseDocument(master: EntityDocument): Promise<EntityDocument | undefined> {
	const mainReleaseId = (master as Master).main_release;

	if (!mainReleaseId) {
		throw new Error('This master has no main release');
	}

	return await fetchEntityDocument(mainReleaseId, 'release');
}

export async function fetchLinkedMasterDocument(release: EntityDocument): Promise<EntityDocument | undefined> {
	const masterId = (release as Release).master_id;

	if (!masterId) {
		throw new Error('This release has no linked master');
	}

	return await fetchEntityDocument(masterId, 'master');
}
