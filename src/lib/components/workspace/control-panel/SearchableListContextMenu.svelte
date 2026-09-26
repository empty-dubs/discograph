<script lang="ts">
	import { onMount, tick } from 'svelte';

	import NodeNavigationActions from '$lib/components/workspace/actions/NodeNavigationActions.svelte';

	import type { GraphNode } from '$lib/graph/types';

	const VIEWPORT_PAD = 8;

	interface Props {
		node: GraphNode;
		x: number;
		y: number;
		onClose: () => void;
	}

	let { node, x, y, onClose }: Props = $props();

	let menu = $state<HTMLDivElement | null>(null);
	let menuLeft = $state(0);
	let menuTop = $state(0);

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	async function resetMenuPosition() {
		await tick();

		if (!menu) return;

		const rect = menu.getBoundingClientRect();

		menuLeft = clamp(x, VIEWPORT_PAD, window.innerWidth - rect.width - VIEWPORT_PAD);
		menuTop = clamp(y, VIEWPORT_PAD, window.innerHeight - rect.height - VIEWPORT_PAD);
	}

	$effect.pre(() => {
		resetMenuPosition();
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}

	onMount(() => {
		const handlePointerDown = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			if (!target.closest('[data-searchable-list-context-menu]')) onClose();
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown);
		window.addEventListener('resize', resetMenuPosition);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('resize', resetMenuPosition);
		};
	});
</script>

<div
	bind:this={menu}
	data-searchable-list-context-menu
	class="border-border bg-panel fixed z-110 min-w-45 overflow-hidden rounded-md border py-1 shadow-lg"
	style:left="{menuLeft}px"
	style:top="{menuTop}px"
	role="menu"
>
	<NodeNavigationActions {node} layout="menu" onAction={onClose} />
</div>
