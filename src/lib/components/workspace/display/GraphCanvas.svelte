<script lang="ts">
	import { onMount } from 'svelte';

	import { ForceGraph } from '$lib/graph/force-graph';
	import { graph } from '$lib/graph/store/graph.svelte';

	import GraphContextMenu from './GraphContextMenu.svelte';

	let container = $state<HTMLDivElement | null>(null);
	let tooltip = $state<{ x: number; y: number; text: string } | null>(null);
	let contextMenu = $state<{ nodeId: string; x: number; y: number } | null>(null);
	let forceGraph: ForceGraph | null = null;

	onMount(() => {
		forceGraph = new ForceGraph(container!, {
			onNodeClick: (id) => {
				contextMenu = null;
				graph.selectNode(id);
			},
			onNodeContextMenu: (id, event) => {
				graph.selectNode(id);
				contextMenu = { nodeId: id, x: event.clientX, y: event.clientY };
			},
			onTooltip: (t) => {
				tooltip = t;
			}
		});

		const resizeObserver = new ResizeObserver(() => forceGraph?.resize());

		resizeObserver.observe(container!);

		return () => {
			resizeObserver.disconnect();
			forceGraph?.destroy();
		};
	});

	$effect(() => {
		if (!forceGraph) return;
		const nodes = graph.visibleNodeList;
		const links = graph.visibleLinkList;
		const showNodeLabels = graph.showNodeLabels;

		if (nodes.length > 0) {
			forceGraph.update(nodes, links, {
				selectedId: graph.selectedId,
				showNodeLabels
			});
		} else {
			forceGraph.clear();
		}

		void graph.visibleTypes;
	});

	$effect(() => {
		if (forceGraph && graph.visibleNodeList.length > 0) {
			forceGraph.updateHighlight({
				selectedId: graph.selectedId
			});
		}

		void graph.selectedId;
	});

	$effect(() => {
		void graph.viewResetToken;
		forceGraph?.resetZoom();
	});
</script>

<div class="bg-canvas relative h-full w-full overflow-hidden rounded-lg">
	<div
		class="h-full w-full"
		bind:this={container}
		role="img"
		aria-label="Discogs relationship graph"
	></div>

	{#if graph.isEmpty}
		<div
			class="text-muted pointer-events-none absolute inset-0 z-10 grid place-items-center text-[0.95rem]"
		>
			Search for an artist, label, or release to begin.
		</div>
	{/if}
</div>

{#if contextMenu}
	<GraphContextMenu
		nodeId={contextMenu.nodeId}
		x={contextMenu.x}
		y={contextMenu.y}
		onClose={() => {
			contextMenu = null;
		}}
	/>
{/if}

{#if tooltip}
	<div
		class="pointer-events-none fixed z-100 max-w-70 rounded bg-black/85 px-2.5 py-1.5 text-xs text-white"
		style:left="{tooltip.x + 12}px"
		style:top="{tooltip.y + 12}px"
	>
		{tooltip.text}
	</div>
{/if}
