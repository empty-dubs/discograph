import { getArtist, getLabel, getMaster, getRelease } from '$lib/discogs/client';

import { updateArtistNode, updateLabelNode, updateMasterNode, updateReleaseNode } from '$lib/graph/operations/patches/nodes';

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
	visited = $state<Map<string, DetailStatus>>(new Map());

	markFetched(nodeId: string) {
		this.visited.set(nodeId, 'fetched');
	}

	clear() {
		this.visited = new Map();
	}
}

export const visitedNodesState = new VisitedNodesState();
