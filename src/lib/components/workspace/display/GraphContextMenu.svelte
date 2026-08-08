<script lang="ts">
	import { onMount } from 'svelte';

	import { graphStore } from '$lib/graph/store/graph-store.svelte';

	import { LOAD_ACTIONS } from '../actions/constants';

	import NodeLoadActions from '../actions/NodeLoadActions.svelte';

	interface Props {
		nodeId: string | null;
		x: number;
		y: number;
		onClose: () => void;
	}

	let { nodeId, x, y, onClose }: Props = $props();

	const node = $derived(nodeId ? (graphStore.nodes.get(nodeId) ?? null) : null);
	const actions = $derived(node ? LOAD_ACTIONS[node.type] : []);
	const hasActions = $derived(actions.length > 0);

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

{#if nodeId && hasActions}
	<div
		data-graph-context-menu
		class="border-border bg-panel fixed z-110 min-w-45 overflow-hidden rounded-md border py-1 shadow-lg"
		style:left="{x}px"
		style:top="{y}px"
		role="menu"
	>
		<NodeLoadActions {nodeId} layout="menu" onAction={onClose} />
	</div>
{/if}
