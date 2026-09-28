<script lang="ts">
	import { seedFromNode } from '$lib/components/shared/loaders/seed';
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';

	import NodeLoadButton from '$lib/components/shared/NodeLoadButton.svelte';
	import SelectedNodeState from '$lib/graph/stores/SelectedNodeState.svelte';
	import CrawlState from '$lib/stores/CrawlState.svelte';

	const node = $derived(SelectedNodeState);

	const collapseDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.hasChildren
		|| node.hasLoadingChildren
		|| CrawlState.isRunning
	);

	const resetDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.data
		|| node.hasLoadingChildren
		|| discogsApi.isRateLimited
		|| CrawlState.isRunning
	);

	const clearDisabled = $derived(
		graph.data.isEmpty
		|| node.hasLoadingChildren
		|| CrawlState.isRunning
	);
</script>

<div class="flex flex-col gap-2" role="group" aria-label="Global graph actions">
	<NodeLoadButton disabled={collapseDisabled} onclick={() => node.collapseNode()}>
		Collapse children
	</NodeLoadButton>

	<NodeLoadButton disabled={resetDisabled} onclick={() => seedFromNode(graph, node.data!)}>
		Reset graph to this node
	</NodeLoadButton>

	<NodeLoadButton
		disabled={clearDisabled}
		onclick={() => {
			graph.clear();
			discogsApi.clear();
		}}
	>
		Clear graph
	</NodeLoadButton>
</div>
