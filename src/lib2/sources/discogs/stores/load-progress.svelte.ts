import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { LoadType, SourceDocumentStatus } from '../types';

class LoadProgressStore {
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

		const nextCompleted = new SvelteMap(this.completedLoadTypes);

		for (const id of ids) {
			nextCompleted.delete(id);
		}

		this.completedLoadTypes = nextCompleted;
	}

	clear() {
		this.completedLoadTypes = new SvelteMap();
		this.documentsInFlight = new SvelteSet();
		this.documentStatuses = new SvelteMap();
	}
}

export const loadProgress = new LoadProgressStore();
