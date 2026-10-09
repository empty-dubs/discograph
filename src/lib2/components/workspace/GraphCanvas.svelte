<script lang="ts">
	import { onMount } from 'svelte';

	import { ForceGraph } from '../../graph/force-graph';
	import { graph } from '../../graph/graph';
	import { nodePresentation } from '../../nexus/bridge';
	let container = $state<HTMLDivElement | null>(null);
	let tooltip = $state<{ x: number; y: number; text: string } | null>(null);
	let forceGraph: ForceGraph | null = null;

	onMount(() => {
		forceGraph = new ForceGraph(container!, {
			nodePresentation: nodePresentation,
			onNodeClick: (id) => {
				graph.presentation.selectNode(id);
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

		const nodes = graph.presentation.visibleNodeList;
		const links = graph.presentation.visibleLinkList;
		const structureRevision = graph.data.revisionCounter;
		const visibilityRevision = graph.presentation.revisionCounter;

		if (nodes.length > 0) {
			forceGraph.update(nodes, links, structureRevision, visibilityRevision);
		} else {
			forceGraph.clear();
			forceGraph.resetZoom();
		}
	});

	$effect(() => {
		if (!forceGraph || graph.presentation.visibleNodeList.length === 0) return;

		forceGraph.setSelectedId(graph.presentation.selectedId);
		forceGraph.setShowNodeLabels(graph.presentation.showNodeLabels);
		forceGraph.setDirectedLinks(graph.presentation.showDirectedLinks);
	});
</script>

<div class="bg-canvas relative h-full w-full overflow-hidden rounded-lg">
	<div class="h-full w-full" bind:this={container} role="img" aria-label="Relationship graph"></div>

	{#if graph.data.isEmpty}
		<div
			class="text-muted pointer-events-none absolute inset-0 z-10 grid place-items-center text-[0.95rem]"
		>
			Search for an artist, label, or release to begin.
		</div>
	{/if}
</div>

{#if tooltip}
	<div
		class="pointer-events-none fixed z-100 max-w-70 rounded bg-black/85 px-2.5 py-1.5 text-white"
		style:left="{tooltip.x + 12}px"
		style:top="{tooltip.y + 12}px"
	>
		{tooltip.text}
	</div>
{/if}
