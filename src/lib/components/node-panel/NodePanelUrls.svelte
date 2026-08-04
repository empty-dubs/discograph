<script lang="ts">
	import { formatUrlDomain } from '$lib/discogs/format';

	interface Props {
		urls: string[];
	}

	let { urls }: Props = $props();
</script>

<div class="space-y-1">
	{#each urls as url (url)}
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
</div>
