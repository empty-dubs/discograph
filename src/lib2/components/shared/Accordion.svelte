<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { chevronDown, chevronRight } from 'svelte-awesome/icons';
	import { getContext, type Snippet } from 'svelte';

	import { RELATED_ENTITIES_ACCORDION_KEY } from './accordion-context';

	import type { Accordion } from './accordion-context';

	interface Props {
		id: string;
		title: string;
		show?: boolean;
		count?: number;
		useRelatedEntitiesAccordion?: boolean;
		children: Snippet;
	}

	let {
		id,
		title,
		show = true,
		count,
		useRelatedEntitiesAccordion = false,
		children
	}: Props = $props();

	const relatedEntitiesAccordion = getContext<Accordion>(RELATED_ENTITIES_ACCORDION_KEY);
</script>

{#if show && useRelatedEntitiesAccordion}
	{const open = $derived(relatedEntitiesAccordion.openSectionId === id)}
	<div class="border-border/50 border-b py-1.5 text-sm last:border-b-0">
		<button
			type="button"
			class="text-muted flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left text-sm select-none"
			aria-expanded={open}
			onclick={() => relatedEntitiesAccordion.toggle(id)}
		>
			<span>{title} {#if count !== undefined && count > 0} ({count.toLocaleString()}){/if}</span>
			<Icon data={open ? chevronDown : chevronRight} />
		</button>

		{#if open}
			<div class="pt-1.5 pb-0.5 text-gray-200">{@render children()}</div>
		{/if}
	</div>
{/if}
