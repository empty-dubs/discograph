import type { LoadAction } from '$lib/components/workspace/actions/constants';

export class ExpansionProgressState {
	loading = $state<Set<string>>(new Set());
	releasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	masterReleasePages = $state<Map<string, { page: number; pages: number }>>(new Map());
	loadedActions = $state<Map<string, Set<LoadAction>>>(new Map());

	setLoading(id: string, isLoading: boolean) {
		const next = new Set(this.loading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.loading = next;
	}

	isLoading(nodeId: string): boolean {
		return this.loading.has(nodeId);
	}

	setReleasePages(nodeId: string, page: number, pages: number) {
		this.releasePages = new Map(this.releasePages).set(nodeId, { page, pages });
	}

	setMasterReleasePages(nodeId: string, page: number, pages: number) {
		this.masterReleasePages = new Map(this.masterReleasePages).set(nodeId, { page, pages });
	}

	markActionLoaded(nodeId: string, action: LoadAction) {
		const next = new Map(this.loadedActions);
		const actions = new Set(next.get(nodeId) ?? []);

		actions.add(action);
		next.set(nodeId, actions);
		this.loadedActions = next;
	}

	hasLoadedAction(nodeId: string, action: LoadAction): boolean {
		return this.loadedActions.get(nodeId)?.has(action) ?? false;
	}

	hasMoreReleases(nodeId: string): boolean {
		const paging = this.releasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	hasMoreMasterReleases(nodeId: string): boolean {
		const paging = this.masterReleasePages.get(nodeId);

		return paging ? paging.page < paging.pages : false;
	}

	clearNodeLoadState(nodeId: string) {
		const nextReleasePages = new Map(this.releasePages);
		const nextMasterReleasePages = new Map(this.masterReleasePages);
		const nextLoadedActions = new Map(this.loadedActions);

		nextReleasePages.delete(nodeId);
		nextMasterReleasePages.delete(nodeId);
		nextLoadedActions.delete(nodeId);

		this.releasePages = nextReleasePages;
		this.masterReleasePages = nextMasterReleasePages;
		this.loadedActions = nextLoadedActions;
	}

	clearNodes(nodeIds: Set<string>) {
		if (nodeIds.size === 0) return;

		const nextReleasePages = new Map(this.releasePages);
		const nextMasterReleasePages = new Map(this.masterReleasePages);
		const nextLoadedActions = new Map(this.loadedActions);

		for (const id of nodeIds) {
			nextReleasePages.delete(id);
			nextMasterReleasePages.delete(id);
			nextLoadedActions.delete(id);
		}

		this.releasePages = nextReleasePages;
		this.masterReleasePages = nextMasterReleasePages;
		this.loadedActions = nextLoadedActions;
	}

	clear() {
		this.loading = new Set();
		this.releasePages = new Map();
		this.masterReleasePages = new Map();
		this.loadedActions = new Map();
	}
}

export const expansionProgressState = new ExpansionProgressState();
