import { getArtist, getLabel, getMaster, getRelease } from '$lib/discogs/client';

import { updateArtistNode, updateLabelNode, updateMasterNode, updateReleaseNode } from '$lib/graph/operations/patches/nodes';

import type { NodeType } from '../types';
import type { DetailStatus, DetailsConfig } from './types';

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
