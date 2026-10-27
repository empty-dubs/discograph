import { SvelteMap } from 'svelte/reactivity';

import { dedupeById } from '../transformations';

import type { LoadType, PagedDocument, PagedReleaseItem } from '../types';

class ReleasesStore {
	releases = $state<SvelteMap<string, Map<LoadType,Array<PagedReleaseItem>>>>(new SvelteMap());

	get(id: string, loadType: LoadType) {
		return this.releases.get(id)?.get(loadType) ?? [];
	}

	set(id: string, document: PagedDocument, loadType: LoadType) {
		const existing = new SvelteMap(this.releases);

		const releaseGroups = new Map(existing.get(id) ?? []);

		const existingReleases = releaseGroups.get(loadType) ?? [];

		const newReleases = [];

		if ('releases' in document) {
			if (loadType === 'master_releases') {
				newReleases.push(...document.releases.filter(release => 'type' in release ? release.type === 'master' : false));
			} else if (loadType === 'releases') {
				newReleases.push(...document.releases.filter(release => 'type' in release ? release.type === 'release' : true));
			} else {
				throw new Error('Invalid load type');
			}
		} else if ('versions' in document) {
			if (loadType === 'releases') {
				newReleases.push(...document.versions);
			} else {
				throw new Error('Invalid load type');
			}
		} else {
			throw new Error('Invalid document type');
		}

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
