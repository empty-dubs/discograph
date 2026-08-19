<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { seedFromNode } from '$lib/components/workspace/actions/loaders/seed';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import NodeLoadActions from '$lib/components/workspace/actions/NodeLoadActions.svelte';

	const node = $derived(selectedNodeState);

	const buttonClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';

	const collapseDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.hasChildren
		|| node.hasLoadingChildren
	);

	const resetDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.data
		|| node.hasLoadingChildren
		|| discogsApi.isRateLimited
	);
</script>

<div class="flex flex-wrap gap-2" role="group" aria-label="Graph actions">
	<NodeLoadActions showAllActions />

	<button
		type="button"
		class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
		disabled={collapseDisabled}
		onclick={() => node.collapseNode()}
	>
		Collapse children
	</button>

	<button
		type="button"
		class="{buttonClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
		disabled={resetDisabled}
		onclick={() => seedFromNode(graph, node.data!)}
	>
		Reset graph to this node
	</button>
</div>
