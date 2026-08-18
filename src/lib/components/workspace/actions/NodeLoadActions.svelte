<script lang="ts">
	import { graph } from '$lib/graph/graph';
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { runLoadAction } from '$lib/components/workspace/actions/loaders/load-action';

	import { selectedNodeState, type SelectedNodeInterface } from '$lib/graph/stores/SelectedNodeState.svelte';

	import { LOAD_ACTION_LABELS, type LoadAction, type PagedLoadButtonState } from './constants';

	interface Props {
		layout?: 'menu' | 'stack';
		onAction?: () => void;
	}

	let { layout = 'stack', onAction }: Props = $props();
	
	const node = $derived(selectedNodeState as SelectedNodeInterface);

	const actions = $derived(node.getVisibleLoadActions);

	const releasesState = $derived.by(() => {
		const loaded = graph.visitedNodes.releasePages.has(node.id!);

		return {
			loaded,
			label: loaded ? 'Load more releases' : 'Load releases',
			exhausted: loaded && !node.hasMoreReleases
		};
	});

	const masterReleasesState = $derived.by(() => {
		const loaded = graph.visitedNodes.masterReleasePages.has(node.id!);

		return {
			loaded,
			label: loaded ? 'Load more master releases' : 'Load master releases',
			exhausted: loaded && !node.hasMoreMasterReleases
		};
	});

	const artistsState = $derived(getLoadButtonState(graph.visitedNodes.loadedActions, node.id!, 'artists'));
	const aliasesState = $derived(getLoadButtonState(graph.visitedNodes.loadedActions, node.id!, 'aliases'));
	const labelsState = $derived(getLoadButtonState(graph.visitedNodes.loadedActions, node.id!, 'labels'));
	const mainReleaseState = $derived(getLoadButtonState(graph.visitedNodes.loadedActions, node.id!, 'main_release'));
	const companiesState = $derived(getLoadButtonState(graph.visitedNodes.loadedActions, node.id!, 'companies'));
	const creditedArtistsState = $derived(
		getLoadButtonState(graph.visitedNodes.loadedActions, node.id!, 'credited_artists')
	);
	const isLoading = $derived(node.hasLoadingChildren || discogsApi.isRateLimited);

	const itemClass = $derived(
		layout === 'menu'
			? 'hover:bg-panel-hover block w-full border-none bg-transparent px-3 py-2 text-left text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent'
			: 'border-border bg-panel-hover cursor-pointer rounded-md border px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
	);

	function getLoadButtonState(
		loadedActions: Map<string, Set<LoadAction>>,
		nodeId: string,
		action: LoadAction
	): PagedLoadButtonState {
		const loaded = loadedActions.get(nodeId)?.has(action) ?? false;

		return {
			loaded,
			label: LOAD_ACTION_LABELS[action],
			exhausted: loaded
		};
	}

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
		onclick={() => run(() => runLoadAction(graph, node, 'artists'))}
	>
		{artistsState.label}
	</button>
{/if}

{#if actions.includes('aliases')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || aliasesState.exhausted}
		onclick={() => run(() => runLoadAction(graph, node, 'aliases'))}
	>
		{aliasesState.label}
	</button>
{/if}

{#if actions.includes('labels')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || labelsState.exhausted}
		onclick={() => run(() => runLoadAction(graph, node, 'labels'))}
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
				runLoadAction(
					graph,
					node,
					'master_releases',
					masterReleasesState.loaded ? { page: 'next' } : undefined
				)
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
				runLoadAction(
					graph,
					node,
					'releases',
					releasesState.loaded ? { page: 'next' } : undefined
				)
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
		onclick={() => run(() => runLoadAction(graph, node, 'main_release'))}
	>
		{mainReleaseState.label}
	</button>
{/if}

{#if actions.includes('companies')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || companiesState.exhausted}
		onclick={() => run(() => runLoadAction(graph, node, 'companies'))}
	>
		{companiesState.label}
	</button>
{/if}

{#if actions.includes('credited_artists')}
	<button
		type="button"
		class={itemClass}
		disabled={isLoading || creditedArtistsState.exhausted}
		onclick={() => run(() => runLoadAction(graph, node, 'credited_artists'))}
	>
		{creditedArtistsState.label}
	</button>
{/if}
