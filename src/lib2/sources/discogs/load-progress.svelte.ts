import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { LoadType, Pagination, SourceDocumentStatus } from './types';

class LoadProgressStore {
	pagedDocuments = $state<SvelteMap<string, Map<LoadType, Pagination>>>(new SvelteMap());
	completedLoadTypes = $state<SvelteMap<string, Set<LoadType>>>(new SvelteMap());
	documentStatuses = $state<SvelteMap<string, SourceDocumentStatus>>(new SvelteMap());

	documentsInFlight = $state<SvelteSet<string>>(new SvelteSet());

	getStatus(id: string): SourceDocumentStatus | undefined {
		return this.documentStatuses.get(id);
	}

	setStatus(id: string, status: SourceDocumentStatus) {
		this.documentStatuses.set(id, status);
	}

	deleteDocumentStatuses(ids: Iterable<string>) {
		for (const id of ids) {
			this.documentStatuses.delete(id);
		}
	}

	isInFlight(id: string): boolean {
		return this.documentsInFlight.has(id);
	}

	async withInFlight<T>(id: string, fn: () => Promise<T>): Promise<T | null> {
		if (this.documentsInFlight.has(id)) return null;

		this.documentsInFlight.add(id);

		try {
			return await fn();
		} finally {
			this.documentsInFlight.delete(id);
		}
	}

	delete(ids: Iterable<string>) {
		for (const id of ids) {
			this.documentsInFlight.delete(id);
		}
	}

	setPagedDocument(id: string, loadType: LoadType, pagination: Pagination) {
		const nextPagedDocument = new SvelteMap(this.pagedDocuments.get(id) ?? []);

		nextPagedDocument.set(loadType, {
			page: pagination.page,
			pages: pagination.pages,
			items: pagination.items
		});

		this.pagedDocuments.set(id, nextPagedDocument);
	}

	getPagedDocument(id: string, loadType: LoadType): Pagination | undefined {
		return this.pagedDocuments.get(id)?.get(loadType);
	}

	hasPagedDocument(id: string, loadType: LoadType): boolean {
		return this.pagedDocuments.get(id)?.has(loadType) ?? false;
	}

	hasMorePages(id: string, loadType: LoadType): boolean {
		const paging = this.getPagedDocument(id, loadType);

		return paging ? paging.page < paging.pages : false;
	}

	markLoadTypeCompleted(id: string, loadType: LoadType) {
		const completed = new Set(this.completedLoadTypes.get(id) ?? []);

		completed.add(loadType);
		this.completedLoadTypes.set(id, completed);
	}

	isLoadTypeCompleted(id: string, loadType: LoadType): boolean {
		return this.completedLoadTypes.get(id)?.has(loadType) ?? false;
	}

	resetForExpandedNodes(ids: Set<string>) {
		if (ids.size === 0) return;

		const nextPaging = new SvelteMap(this.pagedDocuments);
		const nextCompleted = new SvelteMap(this.completedLoadTypes);

		for (const id of ids) {
			nextPaging.delete(id);
			nextCompleted.delete(id);
		}

		this.pagedDocuments = nextPaging;
		this.completedLoadTypes = nextCompleted;
	}

	clear() {
		this.pagedDocuments = new SvelteMap();
		this.completedLoadTypes = new SvelteMap();
		this.documentsInFlight = new SvelteSet();
		this.documentStatuses = new SvelteMap();
	}
}

export const loadProgress = new LoadProgressStore();
