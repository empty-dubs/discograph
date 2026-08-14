<script lang="ts">
	import { onMount } from 'svelte';

	import NodeLoadActions from '../actions/NodeLoadActions.svelte';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	interface Props {
		x: number;
		y: number;
		onClose: () => void;
	}

	let { x, y, onClose }: Props = $props();

	const node = $derived(selectedNodeState);

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

{#if node.id}
	<div
		data-graph-context-menu
		class="border-border bg-panel fixed z-110 min-w-45 overflow-hidden rounded-md border py-1 shadow-lg"
		style:left="{x}px"
		style:top="{y}px"
		role="menu"
	>
		<NodeLoadActions layout="menu" onAction={onClose} />
	</div>
{/if}
