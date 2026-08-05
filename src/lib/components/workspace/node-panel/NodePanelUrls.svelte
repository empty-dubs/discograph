<script lang="ts">
	import { parseDiscogsExternalUrl } from '$lib/discogs/format';

	interface Props {
		urls: string[];
	}

	let { urls }: Props = $props();
</script>

<div class="space-y-1">
	{#each urls as url (url)}
		{@const parsed = parseDiscogsExternalUrl(url)}
		{#if parsed}
			<a
				href={parsed.href}
				title={url}
				target="_blank"
				rel="noopener noreferrer"
				class="text-accent block hover:underline"
			>
				{parsed.display}
			</a>
		{:else}
			<div class="text-gray-200">{url}</div>
		{/if}
	{/each}
</div>
