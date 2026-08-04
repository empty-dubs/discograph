<script lang="ts">
	interface Props {
		items: string[];
	}

	let { items }: Props = $props();
</script>

<div class="space-y-1">
	{#each items as item (item)}
		<div class="text-gray-200">{item}</div>
	{/each}
</div>
