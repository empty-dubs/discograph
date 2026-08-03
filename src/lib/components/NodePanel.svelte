<script lang="ts">
	import { getDiscogsProxyUrl, getDiscogsWebsiteUrl } from '$lib/discogs/urls';
	import NodeLoadActions from '$lib/components/NodeLoadActions.svelte';
	import { graphStore } from '$lib/graph/store.svelte';
	import { getContextMenuActions } from '$lib/graph/menu';
	import { NODE_COLORS } from '$lib/graph/constants';

	const node = $derived(graphStore.selectedNode);

	const websiteUrl = $derived(node ? getDiscogsWebsiteUrl(node) : null);
	const apiUrl = $derived(node ? getDiscogsProxyUrl(node) : null);
	const loadActions = $derived(node ? getContextMenuActions(node) : []);

	const actionClass =
		'rounded-md px-3 py-2 text-center text-sm no-underline disabled:cursor-not-allowed disabled:opacity-50';
</script>

<aside class="bg-panel h-full min-h-0 overflow-y-auto rounded-lg p-4">
	<h2 class="mb-4 text-base font-semibold">Node details</h2>

	{#if node}
		<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
			<dt class="text-muted">Name</dt>
			<dd class="m-0 text-gray-200">{node.displayName}</dd>

			<dt class="text-muted">Type</dt>
			<dd
				class="type-badge m-0 inline-block rounded px-2 py-0.5 text-sm capitalize"
				style:--badge-color={NODE_COLORS[node.type]}
			>
				{node.type}
			</dd>

			{#if node.meta?.year}
				<dt class="text-muted">Year</dt>
				<dd class="m-0 text-gray-200">{node.meta.year}</dd>
			{/if}

			{#if node.meta?.role}
				<dt class="text-muted">Role</dt>
				<dd class="m-0 text-gray-200">{node.meta.role}</dd>
			{/if}

			{#if node.meta?.position}
				<dt class="text-muted">Position</dt>
				<dd class="m-0 text-gray-200">{node.meta.position}</dd>
			{/if}

			{#if node.meta?.duration}
				<dt class="text-muted">Duration</dt>
				<dd class="m-0 text-gray-200">{node.meta.duration}</dd>
			{/if}

			{#if node.meta?.genres?.length}
				<dt class="text-muted">Genres</dt>
				<dd class="m-0 text-gray-200">{node.meta.genres.join(', ')}</dd>
			{/if}

			{#if node.discogsId}
				<dt class="text-muted">Discogs ID</dt>
				<dd class="m-0 text-gray-200">{node.discogsId}</dd>
			{/if}
		</dl>

		<div class="mt-4 flex flex-col gap-2">
			{#if node.type !== 'track' && loadActions.length > 0}
				<NodeLoadActions nodeId={node.id} />
			{/if}

			{#if node.type !== 'track' && graphStore.hasChildren(node.id)}
					<button
						type="button"
						class="{actionClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
						disabled={graphStore.isLoading(node.id)}
						onclick={() => graphStore.collapseNode(node.id)}
					>
						Collapse children
					</button>
			{/if}

			{#if node.type !== 'track'}
				<button
					type="button"
					class="{actionClass} border-border bg-panel-hover cursor-pointer border text-gray-300"
					disabled={graphStore.isLoading(node.id) || graphStore.isRateLimited}
					onclick={() => graphStore.seedFromNode(node)}
				>
					Reset graph to this node
				</button>
			{/if}

			{#if graphStore.hasMoreReleases(node.id)}
				<button
					type="button"
					class="{actionClass} bg-accent cursor-pointer border-none text-white"
					disabled={graphStore.isLoading(node.id) || graphStore.isRateLimited}
					onclick={() => graphStore.loadMoreReleases(node.id)}
				>
					Load more releases
				</button>
			{/if}

			{#if websiteUrl}
				<a
					href={websiteUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="{actionClass} border-border bg-panel-hover border text-gray-300"
				>
					View on Discogs
				</a>
			{/if}

			{#if apiUrl}
				<a
					href={apiUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="{actionClass} border-border bg-panel-hover border text-sm text-gray-300"
				>
					View Payload
				</a>
			{/if}
		</div>
	{:else}
		<p class="text-muted m-0 text-sm">Click a node in the graph to see its details.</p>
	{/if}
</aside>

<style>
	.type-badge {
		background: color-mix(in srgb, var(--badge-color) 25%, transparent);
		color: var(--badge-color);
	}
</style>
