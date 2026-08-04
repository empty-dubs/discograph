<script lang="ts">
	import { onMount } from 'svelte';
	import GraphContextMenu from '$lib/components/GraphContextMenu.svelte';
	import { ForceGraph } from '$lib/graph/force-graph';
	import { graphStore } from '$lib/graph/store.svelte';

	let container = $state<HTMLDivElement | null>(null);
	let tooltip = $state<{ x: number; y: number; text: string } | null>(null);
	let contextMenu = $state<{ nodeId: string; x: number; y: number } | null>(null);
	let graph: ForceGraph | null = null;

	onMount(() => {
		graph = new ForceGraph(container!, {
			onNodeClick: (id) => {
				contextMenu = null;
				graphStore.selectNode(id);
			},
			onNodeContextMenu: (id, event) => {
				graphStore.selectNode(id);
				contextMenu = { nodeId: id, x: event.clientX, y: event.clientY };
			},
			onTooltip: (t) => {
				tooltip = t;
			}
		});

		const resizeObserver = new ResizeObserver(() => graph?.resize());
		resizeObserver.observe(container!);

		return () => {
			resizeObserver.disconnect();
			graph?.destroy();
		};
	});

	$effect(() => {
		const nodes = graphStore.visibleNodeList;
		const links = graphStore.visibleLinkList;

		if (graph) {
			if (nodes.length > 0) {
				graph.update(nodes, links, {
					selectedId: graphStore.selectedId
				});
			} else {
				graph.clear();
			}
		}

		void graphStore.visibleTypes;
	});

	$effect(() => {
		if (graph && graphStore.visibleNodeList.length > 0) {
			graph.updateHighlight({
				selectedId: graphStore.selectedId
			});
		}

		void graphStore.selectedId;
	});

	$effect(() => {
		void graphStore.viewResetToken;
		graph?.resetZoom();
	});
</script>

<div
	class="bg-canvas relative h-full w-full overflow-hidden rounded-lg"
	bind:this={container}
	role="img"
	aria-label="Discogs relationship graph"
>
	{#if graphStore.nodeList.length === 0}
		<div
			class="text-muted pointer-events-none absolute inset-0 grid place-items-center text-[0.95rem]"
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
