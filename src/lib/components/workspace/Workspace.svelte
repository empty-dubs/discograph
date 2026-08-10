<script lang="ts">
	import ControlPanel from './display/ControlPanel.svelte';
	import GraphCanvas from './display/GraphCanvas.svelte';
	import NodePanel from './node-panel/NodePanel.svelte';
</script>

<div
	class="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:grid-rows-1"
>
	<div class="flex min-h-0 flex-col gap-4 md:h-full">
		<div class="min-h-0 flex-1 overflow-hidden">
			<GraphCanvas />
		</div>
		<div class="shrink-0">
			<ControlPanel />
		</div>
	</div>
	<div class="min-h-50 overflow-hidden md:h-full md:min-h-0">
		<NodePanel />
	</div>
</div>
