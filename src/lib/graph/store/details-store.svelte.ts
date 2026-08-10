import { getArtist, getLabel, getMaster, getRelease } from '$lib/discogs/client';

import { createDetailsTracker } from './details/create-details-tracker';
import { mergeArtistDetails } from './details/artist';
import { mergeLabelDetails } from './details/label';
import { mergeMasterDetails } from './details/master';
import { mergeReleaseDetails } from './details/release';
import { graphDataStore } from './data-store.svelte';

import type { Master } from '$lib/discogs/types';
import type { DetailsTrackerContext } from './types';

export type DetailStatus = 'idle' | 'loading' | 'fetched';

class DetailsStore {
	detailsByNodeId = $state<Map<string, DetailStatus>>(new Map());

	private artistTracker = createDetailsTracker({
		nodeType: 'artist',
		fetch: getArtist,
		merge: mergeArtistDetails,
		errorMessage: 'Failed to load artist details'
	});

	private labelTracker = createDetailsTracker({
		nodeType: 'label',
		fetch: getLabel,
		merge: mergeLabelDetails,
		errorMessage: 'Failed to load label details'
	});

	private masterTracker = createDetailsTracker({
		nodeType: 'master',
		fetch: getMaster,
		merge: mergeMasterDetails,
		errorMessage: 'Failed to load master details'
	});

	private releaseTracker = createDetailsTracker({
		nodeType: 'release',
		fetch: getRelease,
		merge: mergeReleaseDetails,
		errorMessage: 'Failed to load release details'
	});

	private ctx(): DetailsTrackerContext {
		return {
			nodes: graphDataStore.nodes,
			parseNodeId: (id) => graphDataStore.parseNodeId(id),
			setNodes: (nodes) => {
				graphDataStore.nodes = nodes;
			},
			isFetched: (nodeId) => this.detailsByNodeId.get(nodeId) === 'fetched',
			isLoading: (nodeId) => this.detailsByNodeId.get(nodeId) === 'loading',
			setStatus: (nodeId, status) => {
				this.detailsByNodeId = new Map(this.detailsByNodeId).set(nodeId, status);
			}
		};
	}

	isDetailsLoading(nodeId: string): boolean {
		return this.detailsByNodeId.get(nodeId) === 'loading';
	}

	isDetailsFetched(nodeId: string): boolean {
		return this.detailsByNodeId.get(nodeId) === 'fetched';
	}

	markArtistDetailsFetched(nodeId: string) {
		this.artistTracker.markFetched(this.ctx(), nodeId);
	}

	markLabelDetailsFetched(nodeId: string) {
		this.labelTracker.markFetched(this.ctx(), nodeId);
	}

	markMasterDetailsFetched(nodeId: string) {
		this.masterTracker.markFetched(this.ctx(), nodeId);
	}

	async ensureArtistDetails(nodeId: string) {
		await this.artistTracker.ensure(this.ctx(), nodeId);
	}

	async ensureLabelDetails(nodeId: string) {
		await this.labelTracker.ensure(this.ctx(), nodeId);
	}

	async mergeMasterDetails(nodeId: string, master: Master) {
		await this.masterTracker.merge(this.ctx(), nodeId, master);
	}

	async ensureMasterDetails(nodeId: string) {
		await this.masterTracker.ensure(this.ctx(), nodeId);
	}

	async ensureReleaseDetails(nodeId: string) {
		await this.releaseTracker.ensure(this.ctx(), nodeId);
	}

	clear() {
		this.detailsByNodeId = new Map();
	}
}

export const detailsStore = new DetailsStore();
