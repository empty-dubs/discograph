<script lang="ts">
	import { graphStore } from '$lib/graph/store.svelte';
	import { getContextMenuActions } from './menu';

	interface Props {
		nodeId: string;
		layout?: 'menu' | 'stack';
		onAction?: () => void;
	}

	let { nodeId, layout = 'stack', onAction }: Props = $props();

	const node = $derived(graphStore.nodes.get(nodeId) ?? null);
	const actions = $derived(node ? getContextMenuActions(node) : []);

	const itemClass = $derived(
		layout === 'menu'
			? 'hover:bg-panel-hover block w-full border-none bg-transparent px-3 py-2 text-left text-sm text-gray-200'
			: 'border-border bg-panel-hover cursor-pointer rounded-md border px-3 py-2 text-sm text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
	);

	async function run(action: () => Promise<void>) {
		await action();
		onAction?.();
	}
</script>

{#if actions.includes('artists')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || graphStore.isRateLimited}
		onclick={() => run(() => graphStore.loadRelatedArtists(nodeId))}
	>
		Load related artists
	</button>
{/if}

{#if actions.includes('labels')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || graphStore.isRateLimited}
		onclick={() => run(() => graphStore.loadRelatedLabels(nodeId))}
	>
		Load related labels
	</button>
{/if}

{#if actions.includes('releases')}
	<button
		type="button"
		class={itemClass}
		disabled={graphStore.isLoading(nodeId) || graphStore.isRateLimited}
		onclick={() => run(() => graphStore.loadReleases(nodeId))}
	>
		Load releases
	</button>
{/if}
