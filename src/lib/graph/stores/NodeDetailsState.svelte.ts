import { getArtist, getLabel, getMaster, getRelease } from '$lib/discogs/client';

import { createDetailsTracker } from './details/create-details-tracker';
import { mergeArtistDetails } from './details/artist';
import { mergeLabelDetails } from './details/label';
import { mergeMasterDetails } from './details/master';
import { mergeReleaseDetails } from './details/release';
import { graphDataState } from './GraphDataState.svelte';

import type { NodeType } from '../types';
import type { Master } from '$lib/discogs/types';
import type { DetailsTrackerContext, DetailStatus, DetailsTrackerConfig } from './types';

const nodeUtils: Record<NodeType, DetailsTrackerConfig<any>> = {
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

	private trackers = {
		artist: createDetailsTracker(nodeUtils.artist),
		label: createDetailsTracker(nodeUtils.label),
		master: createDetailsTracker(nodeUtils.master),
		release: createDetailsTracker(nodeUtils.release)
	}

	private ctx(): DetailsTrackerContext {
		return {
			nodes: graphDataState.nodes,
			setNodes: (nodes) => {
				graphDataState.nodes = nodes;
			},
			setStatus: (nodeId, status) => {
				this.visited = new Map(this.visited).set(nodeId, status);
			}
		};
	}

	isDetailsLoading(nodeId: string): boolean {
		return this.visited.get(nodeId) === 'loading';
	}

	isDetailsFetched(nodeId: string): boolean {
		return this.visited.get(nodeId) === 'fetched';
	}

	markArtistDetailsFetched(nodeId: string) {
		this.trackers.artist.markFetched(this.ctx(), nodeId);
	}

	markLabelDetailsFetched(nodeId: string) {
		this.trackers.label.markFetched(this.ctx(), nodeId);
	}

	markMasterDetailsFetched(nodeId: string) {
		this.trackers.master.markFetched(this.ctx(), nodeId);
	}

	async getArtistDetails(nodeId: string) {
		await this.trackers.artist.getDetails(this.ctx(), nodeId);
	}

	async getLabelDetails(nodeId: string) {
		await this.trackers.label.getDetails(this.ctx(), nodeId);
	}

	async mergeMasterDetails(nodeId: string, master: Master) {
		await this.trackers.master.merge(this.ctx(), nodeId, master);
	}

	async getMasterDetails(nodeId: string) {
		await this.trackers.master.getDetails(this.ctx(), nodeId);
	}

	async getReleaseDetails(nodeId: string) {
		await this.trackers.release.getDetails(this.ctx(), nodeId);
	}

	clear() {
		this.visited = new Map();
	}
}

export const nodeDetailsState = new NodeDetailsState();
