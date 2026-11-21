<script lang="ts">
	import { plugin as source } from '../../../plugins/discogs';

	interface Props {
		type: string;
	}

	let { type }: Props = $props();
</script>

{const entityPresentation = $derived(source.presentation.entities[type])}
{#if entityPresentation}
	<dt class="text-muted">Type</dt>
	<dd class="m-0">
		<span
			class="node-type-surface box-border inline-flex w-[4.5rem] shrink-0 items-center justify-center rounded text-sm capitalize"
			style:--badge-color={entityPresentation.color}
		>
			{entityPresentation.label}
		</span>
	</dd>
{/if}
