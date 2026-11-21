<script lang="ts">
	import SelectedNodeState from '../../../nexus/discogs/stores/SelectedNodeState.svelte';

	const node = $derived(SelectedNodeState);
</script>

{const notes = $derived(node.entityInfo?.notes)}
{const showNotes = $derived(Boolean(notes))}
{const showProfile = $derived(Boolean(node.entityInfo?.profile))}

{#if showProfile}
	<div class="m-0 text-sm">
		{#if node.isProfileLoading}
			<p class="text-muted">Loading profile…</p>
		{:else if node.isProfileFailed}
			<p class="text-muted">Could not load profile.</p>
		{:else}
			<p class="whitespace-pre-wrap">{node.profileText}</p>
		{/if}
	</div>
{/if}

{#if showNotes}
	<p class="m-0 text-sm whitespace-pre-wrap">{notes}</p>
{/if}
