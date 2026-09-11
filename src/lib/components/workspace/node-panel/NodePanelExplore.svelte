<script lang="ts">
	import {
		getDiscogsProxyUrl,
		getDiscogsWebsiteUrl,
		getYouTubeSearchUrl,
		resolveArtistDisplayName
	} from '$lib/components/workspace/actions/compositions';
	import { isDev } from '$lib/app/dev';
	import { graph } from '$lib/graph/graph';
	import { selectedNodeState } from '$lib/graph/stores/SelectedNodeState.svelte';

	const selectedId = $derived(selectedNodeState.id);
	const node = $derived(selectedNodeState.data);

	const websiteUrl = $derived(node ? getDiscogsWebsiteUrl(node) : null);
	const apiUrl = $derived(node ? getDiscogsProxyUrl(node) : null);
	const youtubeUrl = $derived(node ? getYouTubeSearchUrl(node) : null);

	const linkClass =
		'border-border bg-panel-hover text-center rounded-md border px-3 py-2 text-sm text-gray-300 no-underline';
	const enabledClass = `${linkClass} cursor-pointer`;
	const disabledClass = `${linkClass} disabled:cursor-not-allowed disabled:opacity-50`;

	const actions = $derived([
		{ label: 'View on Discogs', url: websiteUrl },
		{ label: 'Search on YouTube', url: youtubeUrl },
		...(isDev && apiUrl ? [{ label: 'View Payload', url: apiUrl }] : [])
	]);
</script>

<div class="border-border/50 mt-3 shrink-0 border-t pt-3">
	<div class="flex flex-col gap-2">
		{#each actions as action (action.label)}
			{#if selectedId && action.url}
				<a
					href={action.url}
					target="_blank"
					rel="noopener noreferrer"
					class={enabledClass}
				>
					{action.label}
				</a>
			{:else}
				<button type="button" disabled class={disabledClass}>
					{action.label}
				</button>
			{/if}
		{/each}
	</div>
</div>
