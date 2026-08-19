<script lang="ts">
	import { graph } from '$lib/graph/graph';
	import { discogsApi } from '$lib/discogs/discogs.svelte';

	import { runLoadAction } from '$lib/components/workspace/actions/loaders/load-action';
	import ControlPanelButton from '$lib/components/workspace/display/control-panel/ControlPanelButton.svelte';

	import { selectedNodeState, type SelectedNodeInterface } from '$lib/graph/stores/SelectedNodeState.svelte';

	import {
		ALL_LOAD_ACTIONS,
		LOAD_ACTION_LABELS,
		type LoadAction,
		type PagedLoadButtonState
	} from './constants';

	interface Props {
		layout?: 'menu' | 'stack';
		showAllActions?: boolean;
		actionTypes?: LoadAction[];
		onAction?: () => void;
	}

	let { layout = 'stack', showAllActions = false, actionTypes, onAction }: Props = $props();

	const node = $derived(selectedNodeState as SelectedNodeInterface);

	const actions = $derived((node.visibleLoadActions ?? []) as LoadAction[]);
	const renderedActions = $derived(
		showAllActions ? (actionTypes ?? ALL_LOAD_ACTIONS) : actions
	);

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

	const isLoading = $derived(node.hasLoadingChildren || discogsApi.isRateLimited);

	const menuClass =
		'hover:bg-panel-hover block w-full border-none bg-transparent px-3 py-2 text-left text-sm text-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent';

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

	function getActionState(action: LoadAction): PagedLoadButtonState {
		const nodeId = node.id ?? '';

		switch (action) {
			case 'releases':
				return releasesState;
			case 'master_releases':
				return masterReleasesState;
			case 'artists':
				return getLoadButtonState(graph.visitedNodes.loadedActions, nodeId, 'artists');
			case 'aliases':
				return getLoadButtonState(graph.visitedNodes.loadedActions, nodeId, 'aliases');
			case 'labels':
				return getLoadButtonState(graph.visitedNodes.loadedActions, nodeId, 'labels');
			case 'main_release':
				return getLoadButtonState(graph.visitedNodes.loadedActions, nodeId, 'main_release');
			case 'companies':
				return getLoadButtonState(graph.visitedNodes.loadedActions, nodeId, 'companies');
			case 'credited_artists':
				return getLoadButtonState(graph.visitedNodes.loadedActions, nodeId, 'credited_artists');
		}
	}

	function isActionDisabled(action: LoadAction): boolean {
		if (!node.id || !node.isDetailsFetched || node.isBlocked) return true;
		if (showAllActions && !actions.includes(action)) return true;

		const state = getActionState(action);

		return isLoading || state.exhausted;
	}

	async function runAction(action: LoadAction) {
		const state = getActionState(action);

		if (action === 'releases') {
			await runLoadAction(
				graph,
				node,
				'releases',
				state.loaded ? { page: 'next' } : undefined
			);
		} else if (action === 'master_releases') {
			await runLoadAction(
				graph,
				node,
				'master_releases',
				state.loaded ? { page: 'next' } : undefined
			);
		} else {
			await runLoadAction(graph, node, action);
		}

		onAction?.();
	}
</script>

{#each renderedActions as action (action)}
	{#if layout === 'menu'}
		<button
			type="button"
			class={menuClass}
			disabled={isActionDisabled(action)}
			onclick={() => runAction(action)}
		>
			{getActionState(action).label}
		</button>
	{:else}
		<ControlPanelButton disabled={isActionDisabled(action)} onclick={() => runAction(action)}>
			{getActionState(action).label}
		</ControlPanelButton>
	{/if}
{/each}
