<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { chevronDown, chevronRight } from 'svelte-awesome/icons';
	import { getContext} from 'svelte';

	import { NODE_PANEL_ACCORDION_KEY, RELATED_ENTITIES_ACCORDION_KEY } from './accordion-context';

	import type { Snippet } from 'svelte';
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

	const nodePanelAccordion = getContext<Accordion>(NODE_PANEL_ACCORDION_KEY);
	const relatedEntitiesAccordion = getContext<Accordion>(RELATED_ENTITIES_ACCORDION_KEY);
</script>

{#if show}
	{const accordion = $derived(useRelatedEntitiesAccordion ? relatedEntitiesAccordion : nodePanelAccordion)}
	{const open = $derived(accordion.openSectionId === id)}
	<div class="border-border/50 border-b py-1.5 text-sm last:border-b-0">
		<button
			type="button"
			class="text-muted flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left text-sm select-none"
			aria-expanded={open}
			onclick={() => accordion.toggle(id)}
		>
			<span>{title} {#if count !== undefined && count > 0} ({count.toLocaleString()}){/if}</span>
			<Icon data={open ? chevronDown : chevronRight} />
		</button>

		{#if open}
			<div class="pt-1.5 pb-0.5 text-gray-200">{@render children()}</div>
		{/if}
	</div>
{/if}
