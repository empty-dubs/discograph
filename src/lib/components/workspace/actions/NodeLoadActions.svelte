<script lang="ts">
	import { graph } from '$lib/graph/store/graph.svelte';
	import { discogsApiStore } from '$lib/discogs/api-store.svelte';

	import {
		loadRelatedArtists,
		loadRelatedAliases,
		loadRelatedCreditedArtists
	} from '$lib/graph/actions/artists';

	import {
		loadRelatedLabels,
		loadRelatedCompanies
	} from '$lib/graph/actions/labels';

	import {
		loadReleases,
		loadMasterReleases,
		loadMainRelease,
		loadMoreReleases,
		loadMoreMasterReleases
	} from '$lib/graph/actions/releases';

	import {
		getMasterReleasesButtonState,
		getReleasesButtonState,
		LOAD_ACTIONS
	} from './constants';

	interface Props {
		nodeId: string;
		layout?: 'menu' | 'stack';
		onAction?: () => void;
	}

	let { nodeId, layout = 'stack', onAction }: Props = $props();

	const node = $derived(graph.nodes.get(nodeId) ?? null);
	const actions = $derived(node ? LOAD_ACTIONS[node.type] : []);

	const releasesState = $derived(
		getReleasesButtonState(graph.releasePages, nodeId, graph.hasMoreReleases(nodeId))
	);
	const masterReleasesState = $derived(
		getMasterReleasesButtonState(
			graph.masterReleasePages,
			nodeId,
			graph.hasMoreMasterReleases(nodeId)
		)
	);
	const isBusy = $derived(graph.isLoading(nodeId) || discogsApiStore.isRateLimited);

	const itemClass = $derived(
		layout === 'menu'
			? 'hover:bg-panel-hover block w-full border-none bg-transparent px-3 py-2 text-left text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
			: 'border-border bg-panel-hover cursor-pointer rounded-md border px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
	);

	async function run(action: () => Promise<void>) {
		await action();
		onAction?.();
	}
</script>

{#if actions.includes('artists')}
	<button
		type="button"
		class={itemClass}
		disabled={graph.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedArtists(graph, nodeId))}
	>
		Load related artists
	</button>
{/if}

{#if actions.includes('aliases')}
	<button
		type="button"
		class={itemClass}
		disabled={graph.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedAliases(graph, nodeId))}
	>
		Load artist aliases
	</button>
{/if}

{#if actions.includes('labels')}
	<button
		type="button"
		class={itemClass}
		disabled={graph.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedLabels(graph, nodeId))}
	>
		Load related labels
	</button>
{/if}

{#if actions.includes('master_releases')}
	<button
		type="button"
		class={itemClass}
		disabled={isBusy || masterReleasesState.exhausted}
		onclick={() =>
			run(() =>
				masterReleasesState.loaded
					? loadMoreMasterReleases(graph, nodeId)
					: loadMasterReleases(graph, nodeId)
			)}
	>
		{masterReleasesState.label}
	</button>
{/if}

{#if actions.includes('releases')}
	<button
		type="button"
		class={itemClass}
		disabled={isBusy || releasesState.exhausted}
		onclick={() =>
			run(() =>
				releasesState.loaded ? loadMoreReleases(graph, nodeId) : loadReleases(graph, nodeId)
			)}
	>
		{releasesState.label}
	</button>
{/if}

{#if actions.includes('main_release')}
	<button
		type="button"
		class={itemClass}
		disabled={graph.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadMainRelease(graph, nodeId))}
	>
		Load main release
	</button>
{/if}

{#if actions.includes('companies')}
	<button
		type="button"
		class={itemClass}
		disabled={graph.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedCompanies(graph, nodeId))}
	>
		Load related companies
	</button>
{/if}

{#if actions.includes('credited_artists')}
	<button
		type="button"
		class={itemClass}
		disabled={graph.isLoading(nodeId) || discogsApiStore.isRateLimited}
		onclick={() => run(() => loadRelatedCreditedArtists(graph, nodeId))}
	>
		Load credited artists
	</button>
{/if}
