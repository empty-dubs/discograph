<script lang="ts">
	import NavigationElement from './NavigationElement.svelte';

	import type { NavigationPayload } from '../../plugins/discogs';

	interface Props {
		items: NavigationPayload[];
	}

	let { items }: Props = $props();
</script>

<div>
	{#each items as item}
		<NavigationElement {item} class="border-t border-border" />
	{/each}
</div>
