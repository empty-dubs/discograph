import { getArtist, getLabel, getMaster, getRelease } from '$lib/discogs/client';

import { mergeArtistDetails } from './details/artist';
import { mergeLabelDetails } from './details/label';
import { mergeMasterDetails } from './details/master';
import { mergeReleaseDetails } from './details/release';

import type { NodeType } from '../types';
import type { DetailStatus, DetailsConfig } from './types';

export const buildConfig: Record<NodeType, DetailsConfig<any>> = {
	artist: {
		nodeType: 'artist',
		fetch: getArtist,
		merge: mergeArtistDetails,
		errorMessage: 'Failed to load artist details'
	},
	label: {
		nodeType: 'label',
		fetch: getLabel,
		merge: mergeLabelDetails,
		errorMessage: 'Failed to load label details'
	},
	master: {
		nodeType: 'master',
		fetch: getMaster,
		merge: mergeMasterDetails,
		errorMessage: 'Failed to load master details'
	},
	release: {
		nodeType: 'release',
		fetch: getRelease,
		merge: mergeReleaseDetails,
		errorMessage: 'Failed to load release details'
	}
}

export class NodeDetailsState {
	visited = $state<Map<string, DetailStatus>>(new Map());

	setStatus(nodeId: string, status: DetailStatus) {
		this.visited = new Map(this.visited).set(nodeId, status);
	}

	markFetched(nodeId: string) {
		this.setStatus(nodeId, 'fetched');
	}

	isDetailsLoading(nodeId: string): boolean {
		return this.visited.get(nodeId) === 'loading';
	}

	isDetailsFetched(nodeId: string): boolean {
		return this.visited.get(nodeId) === 'fetched';
	}

	clear() {
		this.visited = new Map();
	}
}

export const nodeDetailsState = new NodeDetailsState();
