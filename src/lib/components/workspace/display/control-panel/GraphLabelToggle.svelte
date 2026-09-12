<script lang="ts">
	import { graph } from '$lib/graph/graph';

	import ControlPanelButton from './ControlPanelButton.svelte';
</script>

<ControlPanelButton
	pressed={graph.display.showNodeLabels}
	disabled={graph.data.isEmpty}
	onclick={() => graph.display.toggleNodeLabels()}
>
	{graph.display.showNodeLabels ? 'Hide node labels' : 'Show node labels'}
</ControlPanelButton>
