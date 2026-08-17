import type { LoadAction } from '$lib/components/workspace/actions/constants';

type DetailStatus = 'idle' | 'loading' | 'fetched' | 'failed';

export class VisitedNodesState {
	knownChildren = $state<Map<string, Set<string>>>(new Map());
	loadedActions = $state<Map<string, Set<LoadAction>>>(new Map());
	loading = $state<Set<string>>(new Set());
	masterReleasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	releasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
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

	setLoading(id: string, isLoading: boolean) {
		const loading = new Set(this.loading);

		if (isLoading) {
			loading.add(id);
		} else {
			loading.delete(id);
		}

		this.loading = loading;
	}

	setMasterReleasePages(nodeId: string, page: number, pages: number) {
		this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, { page, pages });
	}

	setReleasePages(nodeId: string, page: number, pages: number) {
		this.releasePages = new Map(this.releasePages).set(nodeId, { page, pages });
	}

	resetNodeMaps(expanded: Set<string>, descendants: Set<string>) {
		if (expanded.size === 0 && descendants.size === 0) return;

		const knownChildren = new Map(this.knownChildren);
		const releasePages = new Map(this.releasePages);
		const masterReleasePages = new Map(this.masterReleasePages);
		const loadedActions = new Map(this.loadedActions);
		const status = new Map(this.status);
		const loading = new Set(this.loading);

		for (const id of expanded) {
			knownChildren.delete(id);
			releasePages.delete(id);
			masterReleasePages.delete(id);
			loadedActions.delete(id);
		}

		for (const id of descendants) {
			status.delete(id);
			loading.delete(id);
		}

		this.knownChildren = knownChildren;
		this.releasePages = releasePages;
		this.masterReleasePages = masterReleasePages;
		this.loadedActions = loadedActions;
		this.status = status;
		this.loading = loading;
	}

	clear() {
		this.knownChildren = new Map();
		this.loadedActions = new Map();
		this.loading = new Set();
		this.masterReleasePages = new Map();
		this.releasePages = new Map();
		this.status = new Map();
	}
}

export const visitedNodesState = new VisitedNodesState();
