import { SvelteMap } from 'svelte/reactivity';

import type { LoadType, PagedDocument } from '../types';

class PagedDocumentStore {
	pagedDocuments = $state<SvelteMap<string, Map<LoadType, PagedDocument>>>(new SvelteMap());

	get(id: string, loadType: LoadType) {
		return this.pagedDocuments.get(id)?.get(loadType);
	}

	has(id: string, loadType: LoadType) {
		return this.pagedDocuments.get(id)?.has(loadType) ?? false;
	}

	set(id: string, document: PagedDocument, loadType: LoadType) {
		const existing = new SvelteMap(this.pagedDocuments);

		const existingDocumentGroups = new Map(existing.get(id) ?? []);

		existingDocumentGroups.set(loadType, document);

		existing.set(id, existingDocumentGroups);

		this.pagedDocuments = existing;
	}

	delete(ids: Set<string>) {
		if (ids.size === 0) return;

		const nextPaged = new SvelteMap(this.pagedDocuments);

		for (const id of ids) nextPaged.delete(id);

		this.pagedDocuments = nextPaged;
	}

	clear() {
		this.pagedDocuments = new SvelteMap();
	}
}

export const pagedDocumentStore = new PagedDocumentStore();
