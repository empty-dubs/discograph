<script lang="ts">
	import { Icon } from 'svelte-awesome';
	import { chevronDown } from 'svelte-awesome/icons';
	import { chevronRight } from 'svelte-awesome/icons';
	import { getContext, type Snippet } from 'svelte';

	import { NODE_PANEL_ACCORDION_KEY, type NodePanelAccordion } from '../accordion';

	interface Props {
		id: string;
		title: string;
		show?: boolean;
		children: Snippet;
	}

	let { id, title, show = true, children }: Props = $props();

	const accordion = getContext<NodePanelAccordion>(NODE_PANEL_ACCORDION_KEY);
	const open = $derived(accordion.openSectionId === id);
</script>

{#if show}
	<div class="border-border/50 border-b py-1.5 text-sm last:border-b-0">
		<button
			type="button"
			class="text-muted flex w-full cursor-pointer items-center justify-between gap-2 border-none bg-transparent p-0 text-left text-sm select-none"
			aria-expanded={open}
			onclick={() => accordion.toggle(id)}
		>
			<span>{title}</span>
			<Icon data={open ? chevronDown : chevronRight} />
		</button>

		{#if open}
			<div class="pt-1.5 pb-0.5 text-gray-200">{@render children()}</div>
		{/if}
	</div>
{/if}
