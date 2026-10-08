<script lang="ts">
	import ControlPanel from './control-panel/ControlPanel.svelte';
	import GraphCanvas from './GraphCanvas.svelte';

	let controlPanelExpanded = $state(true);
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div class="grid min-h-0 flex-[2] grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
		<div class="min-h-0 h-full overflow-hidden">
			<GraphCanvas />
		</div>
		<div class="bg-panel border-border min-h-50 overflow-hidden rounded-md border md:h-full md:min-h-0"></div>
	</div>

	<div class="min-h-0 overflow-hidden {controlPanelExpanded ? 'flex-1' : 'shrink-0'}">
		<ControlPanel bind:isExpanded={controlPanelExpanded} />
	</div>
</div>
