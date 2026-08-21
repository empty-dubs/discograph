<script lang="ts">
	import ControlPanel from './display/ControlPanel.svelte';
	import GraphCanvas from './display/GraphCanvas.svelte';
	import Canvas from './display/Canvas.svelte';
	import NodePanel from './node-panel/NodePanel.svelte';
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4">
	<div
		class="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]"
	>
		<div class="min-h-0 h-full overflow-hidden">
			<GraphCanvas />
			<!-- <Canvas /> -->
		</div>
		<div class="min-h-50 overflow-hidden md:h-full md:min-h-0">
			<NodePanel />
		</div>
	</div>

	<div class="shrink-0">
		<ControlPanel />
	</div>
</div>
