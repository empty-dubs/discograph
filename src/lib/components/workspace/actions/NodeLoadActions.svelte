<script lang="ts">
	import { graph } from '$lib/graph/stores/graph.svelte';
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import {
		loadRelatedArtists,
		loadRelatedAliases,
		loadRelatedCreditedArtists
	} from '$lib/graph/loaders/artists';

	import {
		loadRelatedLabels,
		loadRelatedCompanies
	} from '$lib/graph/loaders/labels';

	import {
		loadReleases,
		loadMasterReleases,
		loadMainRelease,
		loadMoreReleases,
		loadMoreMasterReleases
	} from '$lib/graph/loaders/releases';

	import {
		getLoadButtonState,
		getMasterReleasesButtonState,
		getReleasesButtonState,
		getVisibleLoadActions
	} from './constants';

	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	interface Props {
		layout?: 'menu' | 'stack';
		onAction?: () => void;
	}

	let { layout = 'stack', onAction }: Props = $props();
	
	const node = $derived(selectedNodeState);

	const actions = $derived(
		node.id ? getVisibleLoadActions(node.node!, node.isDetailsFetched!) : []
	);

	const releasesState = $derived(
		getReleasesButtonState(graph.releasePages, node.id!, node.hasMoreReleases)
	);
	const masterReleasesState = $derived(
		getMasterReleasesButtonState(
			graph.masterReleasePages,
			node.id!,
			node.hasMoreMasterReleases
		)
	);
	const artistsState = $derived(getLoadButtonState(graph.loadedActions, node.id!, 'artists'));
	const aliasesState = $derived(getLoadButtonState(graph.loadedActions, node.id!, 'aliases'));
	const labelsState = $derived(getLoadButtonState(graph.loadedActions, node.id!, 'labels'));
	const mainReleaseState = $derived(getLoadButtonState(graph.loadedActions, node.id!, 'main_release'));
	const companiesState = $derived(getLoadButtonState(graph.loadedActions, node.id!, 'companies'));
	const creditedArtistsState = $derived(
		getLoadButtonState(graph.loadedActions, node.id!, 'credited_artists')
	);
	const isLoading = $derived(graph.progress.isLoading(node.id!) || discogsApi.isRateLimited);

	const itemClass = $derived(
		layout === 'menu'
			? 'hover:bg-panel-hover block w-full border-none bg-transparent px-3 py-2 text-left text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
			: 'border-border bg-panel-hover cursor-pointer rounded-md border px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
	);

	async function run(action: () => Promise<void>) {
		await action();
		onAction?.();
	}

	$effect(() => {
		if (!node?.id) return;

		node.ensureDetails();
	});
</script>

{#if actions.includes('artists')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || artistsState.exhausted}
		onclick={() => run(() => loadRelatedArtists(graph, node.id!))}
	>
		{artistsState.label}
	</button>
{/if}

{#if actions.includes('aliases')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || aliasesState.exhausted}
		onclick={() => run(() => loadRelatedAliases(graph, node.id!))}
	>
		{aliasesState.label}
	</button>
{/if}

{#if actions.includes('labels')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || labelsState.exhausted}
		onclick={() => run(() => loadRelatedLabels(graph, node.id!))}
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
					? loadMoreMasterReleases(graph, node.id!)
					: loadMasterReleases(graph, node.id!)
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
				releasesState.loaded ? loadMoreReleases(graph, node.id!) : loadReleases(graph, node.id!)
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
		onclick={() => run(() => loadMainRelease(graph, node.id!))}
	>
		{mainReleaseState.label}
	</button>
{/if}

{#if actions.includes('companies')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || companiesState.exhausted}
		onclick={() => run(() => loadRelatedCompanies(graph, node.id!))}
	>
		{companiesState.label}
	</button>
{/if}

{#if actions.includes('credited_artists')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || creditedArtistsState.exhausted}
		onclick={() => run(() => loadRelatedCreditedArtists(graph, node.id!))}
	>
		{creditedArtistsState.label}
	</button>
{/if}
