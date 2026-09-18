<script lang="ts">
	import { seedFromNode } from '$lib/components/workspace/actions/loaders/seed';
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { crawlState } from '$lib/graph/stores/CrawlState.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import ControlPanelButton from './ControlPanelButton.svelte';

	const node = $derived(selectedNodeState);

	const collapseDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.hasChildren
		|| node.hasLoadingChildren
		|| crawlState.isRunning
	);

	const resetDisabled = $derived(
		!node.isDetailsFetched
		|| node.isBlocked
		|| !node.data
		|| node.hasLoadingChildren
		|| discogsApi.isRateLimited
		|| crawlState.isRunning
	);

	const clearDisabled = $derived(
		graph.data.isEmpty
		|| node.hasLoadingChildren
		|| crawlState.isRunning
	);
</script>

<div class="flex flex-col gap-2" role="group" aria-label="Global graph actions">
	<ControlPanelButton disabled={collapseDisabled} onclick={() => node.collapseNode()}>
		Collapse children
	</ControlPanelButton>

	<ControlPanelButton disabled={resetDisabled} onclick={() => seedFromNode(graph, node.data!)}>
		Reset graph to this node
	</ControlPanelButton>

	<ControlPanelButton
		disabled={clearDisabled}
		onclick={() => {
			graph.clear();
			discogsApi.clear();
		}}
	>
		Clear graph
	</ControlPanelButton>
</div>
