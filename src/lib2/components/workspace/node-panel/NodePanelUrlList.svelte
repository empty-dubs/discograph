<script lang="ts">
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const entityInfo = $derived(SelectedNodeState.entityInfo);
</script>

{const urls = $derived(entityInfo?.urls ?? []);}
<div class="space-y-1">
	{#each urls as url}
		<a href={url.href} title={url.label} target="_blank" rel="noopener noreferrer" class="text-accent block hover:underline">
			{url.label}
		</a>
	{/each}
</div>
