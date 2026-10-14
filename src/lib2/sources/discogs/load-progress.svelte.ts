import { SvelteMap } from 'svelte/reactivity';

import type { LoadType, Pagination } from './types';

class LoadProgressStore {
	pagedDocuments = $state<SvelteMap<string, Map<LoadType, Pagination>>>(new SvelteMap());
	completedLoadTypes = $state<SvelteMap<string, Set<LoadType>>>(new SvelteMap());

	setPagedDocument(nodeId: string, loadType: LoadType, pagination: Pagination) {
		const nextPagedDocument = new SvelteMap(this.pagedDocuments.get(nodeId) ?? []);

		nextPagedDocument.set(loadType, {
			page: pagination.page,
			pages: pagination.pages,
			items: pagination.items
		});

		this.pagedDocuments.set(nodeId, nextPagedDocument);
	}

	getPagedDocument(nodeId: string, loadType: LoadType): Pagination | undefined {
		return this.pagedDocuments.get(nodeId)?.get(loadType);
	}

	hasPagedDocument(nodeId: string, loadType: LoadType): boolean {
		return this.pagedDocuments.get(nodeId)?.has(loadType) ?? false;
	}

	hasMorePages(nodeId: string, loadType: LoadType): boolean {
		const paging = this.getPagedDocument(nodeId, loadType);

		return paging ? paging.page < paging.pages : false;
	}

	markLoadTypeCompleted(nodeId: string, loadType: LoadType) {
		const completed = new Set(this.completedLoadTypes.get(nodeId) ?? []);

		completed.add(loadType);
		this.completedLoadTypes.set(nodeId, completed);
	}

	isLoadTypeCompleted(nodeId: string, loadType: LoadType): boolean {
		return this.completedLoadTypes.get(nodeId)?.has(loadType) ?? false;
	}

	resetForExpandedNodes(nodeIds: Set<string>) {
		if (nodeIds.size === 0) return;

		const nextPaging = new SvelteMap(this.pagedDocuments);
		const nextCompleted = new SvelteMap(this.completedLoadTypes);

		for (const id of nodeIds) {
			nextPaging.delete(id);
			nextCompleted.delete(id);
		}

		this.pagedDocuments = nextPaging;
		this.completedLoadTypes = nextCompleted;
	}

	clear() {
		this.pagedDocuments = new SvelteMap();
		this.completedLoadTypes = new SvelteMap();
	}
}

export const loadProgress = new LoadProgressStore();
