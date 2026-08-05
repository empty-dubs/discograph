<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	import { NODE_PANEL_ACCORDION_KEY, type NodePanelAccordion } from './accordion';

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
			<svg
				class="size-4 shrink-0 {open
					? 'rotate-180'
					: 'rotate-0'}"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		{#if open}
			<div class="pt-1.5 pb-0.5 text-gray-200">{@render children()}</div>
		{/if}
	</div>
{/if}
