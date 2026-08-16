import { getArtist, getLabel, getMaster, getRelease } from '$lib/discogs/client';

import { updateArtistNode, updateLabelNode, updateMasterNode, updateReleaseNode } from '$lib/graph/operations/patches/nodes';

import type { LoadAction } from '$lib/components/workspace/actions/constants';

import type { GraphNode, NodeType } from '../types';

import type { GraphInterface } from '$lib/graph/graph';

type DetailStatus = 'idle' | 'loading' | 'fetched';

type EntityMergeFn<T> = (
	node: GraphNode,
	graph: GraphInterface,
	entity: T
) => void | Promise<void>;

interface DetailsConfig<T> {
	nodeType: NodeType;
	fetch: (id: number) => Promise<T>;
	merge: EntityMergeFn<T>;
	errorMessage: string;
}

export const buildConfig: Record<NodeType, DetailsConfig<any>> = {
	artist: {
		nodeType: 'artist',
		fetch: getArtist,
		merge: updateArtistNode,
		errorMessage: 'Failed to load artist details'
	},
	label: {
		nodeType: 'label',
		fetch: getLabel,
		merge: updateLabelNode,
		errorMessage: 'Failed to load label details'
	},
	master: {
		nodeType: 'master',
		fetch: getMaster,
		merge: updateMasterNode,
		errorMessage: 'Failed to load master details'
	},
	release: {
		nodeType: 'release',
		fetch: getRelease,
		merge: updateReleaseNode,
		errorMessage: 'Failed to load release details'
	}
}

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
		const next = new Map(this.loadedActions);
		const actions = new Set(next.get(nodeId) ?? []);

		actions.add(action);
		next.set(nodeId, actions);
		this.loadedActions = next;
	}

	setDetailStatus(nodeId: string, status: DetailStatus) {
		this.status = new Map(this.status).set(nodeId, status);
	}

	setLoading(id: string, isLoading: boolean) {
		const next = new Set(this.loading);

		if (isLoading) {
			next.add(id);
		} else {
			next.delete(id);
		}

		this.loading = next;
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
