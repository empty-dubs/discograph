import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import type { LoadAction } from '$lib/components/workspace/actions/constants';

type DetailStatus = 'idle' | 'loading' | 'fetched' | 'failed';

type ReleasePaging = { page: number; pages: number; items: number };

export class VisitedNodesState {
	knownChildren = $state<SvelteMap<string, Set<string>>>(new SvelteMap());
	loadedActions = $state<SvelteMap<string, Set<LoadAction>>>(new SvelteMap());
	withLoadingChildren = $state<SvelteSet<string>>(new SvelteSet());
	masterReleasePages = $state<SvelteMap<string, ReleasePaging>>(new SvelteMap());
	releasePages = $state<SvelteMap<string, ReleasePaging>>(new SvelteMap());
	status = $state<SvelteMap<string, DetailStatus>>(new SvelteMap());

	hasMoreReleases(nodeId: string): boolean {
		const paging = this.releasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	hasMoreMasterReleases(nodeId: string): boolean {
		const paging = this.masterReleasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	markActionLoaded(nodeId: string, action: LoadAction) {
		const actions = new Set(this.loadedActions.get(nodeId) ?? []);

		actions.add(action);
		this.loadedActions.set(nodeId, actions);
	}

	setDetailStatus(nodeId: string, status: DetailStatus) {
		this.status.set(nodeId, status);
	}

	setMasterReleasePages(nodeId: string, page: number, pages: number, items: number) {
		this.masterReleasePages.set(nodeId, { page, pages, items });
	}

	setReleasePages(nodeId: string, page: number, pages: number, items: number) {
		this.releasePages.set(nodeId, { page, pages, items });
	}

	resetNodeMaps(expanded: Set<string>, descendants: Set<string>) {
		if (expanded.size === 0 && descendants.size === 0) return;

		for (const id of expanded) {
			this.knownChildren.delete(id);
			this.releasePages.delete(id);
			this.masterReleasePages.delete(id);
			this.loadedActions.delete(id);
		}

		for (const id of descendants) {
			this.status.delete(id);
			this.withLoadingChildren.delete(id);
		}
	}

	clear() {
		this.knownChildren = new SvelteMap();
		this.loadedActions = new SvelteMap();
		this.withLoadingChildren = new SvelteSet();
		this.masterReleasePages = new SvelteMap();
		this.releasePages = new SvelteMap();
		this.status = new SvelteMap();
	}
}

export const visitedNodesState = new VisitedNodesState();
