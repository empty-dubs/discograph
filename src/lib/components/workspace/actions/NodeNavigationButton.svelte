<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		layout?: 'panel' | 'menu';
		href?: string;
		disabled?: boolean;
		role?: string;
		class?: string;
		onclick?: (event: MouseEvent) => void;
		children: Snippet;
	}

	let {
		layout = 'panel',
		href,
		disabled = false,
		role,
		class: className = '',
		onclick,
		children
	}: Props = $props();

	const layoutClass = $derived(layout === 'menu' ? 'ui-list-button' : 'ui-explore-link');
	const disabledClass = $derived(disabled ? 'cursor-not-allowed opacity-50' : '');
	const combinedClass = $derived(
		`${layoutClass} ${disabledClass} ${href && !disabled && layout === 'panel' ? 'block' : ''} ${className}`.trim()
	);
</script>

{#if href && !disabled}
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		{role}
		class={combinedClass}
		{onclick}
	>
		{@render children()}
	</a>
{:else}
	<button type="button" {role} class={combinedClass} {disabled} {onclick}>
		{@render children()}
	</button>
{/if}
