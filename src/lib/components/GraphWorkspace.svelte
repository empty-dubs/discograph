<script lang="ts">
	import GraphCanvas from './GraphCanvas.svelte';
	import NodePanel from './node-panel/NodePanel.svelte';
</script>

<div
	class="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px] md:grid-rows-1"
>
	<div class="min-h-[280px] overflow-hidden md:h-full md:min-h-0">
		<GraphCanvas />
	</div>
	<div class="min-h-[200px] overflow-hidden md:h-full md:min-h-0">
		<NodePanel />
	</div>
</div>
