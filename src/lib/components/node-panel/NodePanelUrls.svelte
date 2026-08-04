<script lang="ts">
	import { formatUrlDomain } from '$lib/discogs/format';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	const showUrls = $derived(
		(node.type === 'artist' || node.type === 'label') && (node.urls?.length ?? 0) > 0
	);
</script>

{#if showUrls && node.urls}
	<dt class="text-muted">URLs</dt>
	<dd class="m-0 space-y-1">
		{#each node.urls as url (url)}
			<a
				href={url}
				title={url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-accent block hover:underline"
			>
				{formatUrlDomain(url)}
			</a>
		{/each}
	</dd>
{/if}
