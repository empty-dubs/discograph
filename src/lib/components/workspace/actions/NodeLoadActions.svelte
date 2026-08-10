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
		getLoadButtonState,
		getMasterReleasesButtonState,
		getReleasesButtonState,
		getVisibleLoadActions
	} from './constants';

	interface Props {
		nodeId: string;
		layout?: 'menu' | 'stack';
		onAction?: () => void;
	}

	let { nodeId, layout = 'stack', onAction }: Props = $props();

	const node = $derived(graph.nodes.get(nodeId) ?? null);
	const actions = $derived(
		node ? getVisibleLoadActions(node, (id) => graph.isDetailsFetched(id)) : []
	);

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
	const artistsState = $derived(getLoadButtonState(graph.loadedActions, nodeId, 'artists'));
	const aliasesState = $derived(getLoadButtonState(graph.loadedActions, nodeId, 'aliases'));
	const labelsState = $derived(getLoadButtonState(graph.loadedActions, nodeId, 'labels'));
	const mainReleaseState = $derived(getLoadButtonState(graph.loadedActions, nodeId, 'main_release'));
	const companiesState = $derived(getLoadButtonState(graph.loadedActions, nodeId, 'companies'));
	const creditedArtistsState = $derived(
		getLoadButtonState(graph.loadedActions, nodeId, 'credited_artists')
	);
	const isLoading = $derived(graph.isLoading(nodeId) || discogsApiStore.isRateLimited);

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
		disabled={isLoading || artistsState.exhausted}
		onclick={() => run(() => loadRelatedArtists(graph, nodeId))}
	>
		{artistsState.label}
	</button>
{/if}

{#if actions.includes('aliases')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || aliasesState.exhausted}
		onclick={() => run(() => loadRelatedAliases(graph, nodeId))}
	>
		{aliasesState.label}
	</button>
{/if}

{#if actions.includes('labels')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || labelsState.exhausted}
		onclick={() => run(() => loadRelatedLabels(graph, nodeId))}
	>
		{labelsState.label}
	</button>
{/if}

{#if actions.includes('master_releases')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || masterReleasesState.exhausted}
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
		disabled={isLoading || releasesState.exhausted}
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
		disabled={isLoading || mainReleaseState.exhausted}
		onclick={() => run(() => loadMainRelease(graph, nodeId))}
	>
		{mainReleaseState.label}
	</button>
{/if}

{#if actions.includes('companies')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || companiesState.exhausted}
		onclick={() => run(() => loadRelatedCompanies(graph, nodeId))}
	>
		{companiesState.label}
	</button>
{/if}

{#if actions.includes('credited_artists')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || creditedArtistsState.exhausted}
		onclick={() => run(() => loadRelatedCreditedArtists(graph, nodeId))}
	>
		{creditedArtistsState.label}
	</button>
{/if}
