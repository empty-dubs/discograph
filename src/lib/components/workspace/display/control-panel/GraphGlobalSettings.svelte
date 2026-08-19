<script lang="ts">
	import { discogsApi } from '$lib/discogs/discogs.svelte';
	import { graph } from '$lib/graph/graph';
	import { seedFromNode } from '$lib/components/workspace/actions/loaders/seed';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	import ControlPanelButton from './ControlPanelButton.svelte';

	const node = $derived(selectedNodeState);

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

<div class="flex flex-col gap-2" role="group" aria-label="Global graph settings">
	<ControlPanelButton
		pressed={graph.display.showNodeLabels}
		disabled={graph.data.isEmpty}
		onclick={() => graph.display.toggleNodeLabels()}
	>
		{graph.display.showNodeLabels ? 'Hide labels' : 'Show labels'}
	</ControlPanelButton>

	<ControlPanelButton disabled={collapseDisabled} onclick={() => node.collapseNode()}>
		Collapse children
	</ControlPanelButton>

	<ControlPanelButton disabled={resetDisabled} onclick={() => seedFromNode(graph, node.data!)}>
		Reset graph to this node
	</ControlPanelButton>

	<ControlPanelButton
		disabled={graph.data.isEmpty || node.hasLoadingChildren}
		onclick={() => {
			graph.clear();
			discogsApi.clear();
		}}
	>
		Clear graph
	</ControlPanelButton>
</div>
