import { SvelteMap } from 'svelte/reactivity';

import { dedupeById } from '../transformations';

import type { EntityType, LoadType, PagedDocument, PagedReleaseItem } from '../types';

function itemsFromPagedDocument(
	document: PagedDocument,
	loadType: LoadType,
	parentType: EntityType
): PagedReleaseItem[] {
	if ('versions' in document) {
		if (parentType !== 'master' || loadType !== 'releases') {
			throw new Error('Invalid load type for master versions');
		}

		return document.versions;
	}

	if (!('releases' in document)) {
		throw new Error('Invalid document type');
	}

	if (parentType === 'label') {
		return loadType === 'releases' ? document.releases : [];
	}

	if (parentType === 'artist') {
		const kind = loadType === 'master_releases' ? 'master' : 'release';

		return document.releases.filter((release) => 'type' in release && release.type === kind);
	}

	throw new Error(`Invalid parent type for paged releases: ${parentType}`);
}

class ReleasesStore {
	releases = $state<SvelteMap<string, Map<LoadType,Array<PagedReleaseItem>>>>(new SvelteMap());

	get(id: string, loadType: LoadType) {
		return this.releases.get(id)?.get(loadType) ?? [];
	}

	set(id: string, document: PagedDocument, loadType: LoadType, parentType: EntityType) {
		const existing = new SvelteMap(this.releases);

		const releaseGroups = new Map(existing.get(id) ?? []);

		const existingReleases = releaseGroups.get(loadType) ?? [];

		const newReleases = itemsFromPagedDocument(document, loadType, parentType);

		const releases = dedupeById([...existingReleases, ...newReleases]);

		releaseGroups.set(loadType, releases);

		existing.set(id, releaseGroups);

		this.releases = existing;
	}

	delete(ids: Set<string>) {
		if (ids.size === 0) return;

		const nextReleases = new SvelteMap(this.releases);

		for (const id of ids) nextReleases.delete(id);

		this.releases = nextReleases;
	}

	clear() {
		this.releases = new SvelteMap();
	}
}

export const releasesStore = new ReleasesStore();
