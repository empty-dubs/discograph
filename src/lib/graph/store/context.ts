import { graphDataStore } from './data-store.svelte';
import { detailsStore } from './details-store.svelte';
import { expansionStore } from './expansion-store.svelte';
import { expansionProgressStore } from './expansion-progress-store.svelte';
import { graphUiStore } from './ui-store.svelte';

export const graphCtx = {
	data: graphDataStore,
	ui: graphUiStore,
	expansion: expansionStore,
	progress: expansionProgressStore,
	details: detailsStore
} as const;

export type GraphContext = typeof graphCtx;
