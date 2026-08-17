import { SvelteSet } from 'svelte/reactivity';

import type { LoadAction } from '$lib/components/workspace/actions/constants';

type DetailStatus = 'idle' | 'loading' | 'fetched' | 'failed';

type ReleasePaging = { page: number; pages: number; items: number };

export class VisitedNodesState {
	knownChildren = $state<Map<string, Set<string>>>(new Map());
	loadedActions = $state<Map<string, Set<LoadAction>>>(new Map());
	loading = $state<SvelteSet<string>>(new SvelteSet());
	masterReleasePages = $state<Map<string, ReleasePaging>>(new Map());
	releasePages = $state<Map<string, ReleasePaging>>(new Map());
	status = $state<Map<string, DetailStatus>>(new Map());

	hasMoreReleases(nodeId: string): boolean {
		const paging = this.releasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	hasMoreMasterReleases(nodeId: string): boolean {
		const paging = this.masterReleasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	markActionLoaded(nodeId: string, action: LoadAction) {
		const loadActions = new Map(this.loadedActions);
		const actions = new Set(loadActions.get(nodeId) ?? []);

		actions.add(action);
		loadActions.set(nodeId, actions);
		this.loadedActions = loadActions;
	}

	setDetailStatus(nodeId: string, status: DetailStatus) {
		this.status = new Map(this.status).set(nodeId, status);
	}

	setMasterReleasePages(nodeId: string, page: number, pages: number, items: number) {
		this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, { page, pages, items });
	}

	setReleasePages(nodeId: string, page: number, pages: number, items: number) {
		this.releasePages = new Map(this.releasePages).set(nodeId, { page, pages, items });
	}

	resetNodeMaps(expanded: Set<string>, descendants: Set<string>) {
		if (expanded.size === 0 && descendants.size === 0) return;

		const knownChildren = new Map(this.knownChildren);
		const releasePages = new Map(this.releasePages);
		const masterReleasePages = new Map(this.masterReleasePages);
		const loadedActions = new Map(this.loadedActions);
		const status = new Map(this.status);

		for (const id of expanded) {
			knownChildren.delete(id);
			releasePages.delete(id);
			masterReleasePages.delete(id);
			loadedActions.delete(id);
		}

		for (const id of descendants) {
			status.delete(id);
			this.loading.delete(id);
		}

		this.knownChildren = knownChildren;
		this.releasePages = releasePages;
		this.masterReleasePages = masterReleasePages;
		this.loadedActions = loadedActions;
		this.status = status;
	}

	clear() {
		this.knownChildren = new Map();
		this.loadedActions = new Map();
		this.loading = new SvelteSet();
		this.masterReleasePages = new Map();
		this.releasePages = new Map();
		this.status = new Map();
	}
}

export const visitedNodesState = new VisitedNodesState();
