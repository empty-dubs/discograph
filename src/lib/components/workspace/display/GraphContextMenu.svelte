<script lang="ts">
	import { onMount } from 'svelte';

	import NodeLoadActions from '../actions/NodeLoadActions.svelte';
	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode | null;
		x: number;
		y: number;
		onClose: () => void;
	}

	let { node, x, y, onClose }: Props = $props();

	function handleKeydown(event: KeyboardEvent) {
		event.preventDefault();

		if (event.key === 'Escape') onClose();
	}

	onMount(() => {
		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('[data-graph-context-menu]')) onClose();
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if node}
	<div
		data-graph-context-menu
		class="border-border bg-panel fixed z-110 min-w-45 overflow-hidden rounded-md border py-1 shadow-lg"
		style:left="{x}px"
		style:top="{y}px"
		role="menu"
	>
		<NodeLoadActions {node} layout="menu" onAction={onClose} />
	</div>
{/if}
