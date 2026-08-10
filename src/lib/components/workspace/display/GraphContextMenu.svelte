<script lang="ts">
	import { onMount } from 'svelte';

	import { graph } from '$lib/graph/store/graph.svelte';

	import { getVisibleLoadActions } from '../actions/constants';

	import NodeLoadActions from '../actions/NodeLoadActions.svelte';

	interface Props {
		nodeId: string | null;
		x: number;
		y: number;
		onClose: () => void;
	}

	let { nodeId, x, y, onClose }: Props = $props();

	const node = $derived(nodeId ? (graph.nodes.get(nodeId) ?? null) : null);
	const actions = $derived(
		node ? getVisibleLoadActions(node, (id) => graph.isDetailsFetched(id)) : []
	);
	const hasActions = $derived(actions.length > 0);

	$effect(() => {
		if (!node) return;

		if (node.type === 'artist') {
			graph.ensureArtistDetails(node.id);
		}

		if (node.type === 'label') {
			graph.ensureLabelDetails(node.id);
		}

		if (node.type === 'master') {
			graph.ensureMasterDetails(node.id);
		}
	});

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
