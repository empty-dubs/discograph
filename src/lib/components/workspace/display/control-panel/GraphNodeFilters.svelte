<script lang="ts">
	import { ALL_NODE_TYPES, NODE_TYPE_LABELS } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';

	import type { NodeType } from '$lib/graph/types';

	import ControlPanelButton from './ControlPanelButton.svelte';

	interface Props {
		types?: NodeType[];
	}

	let { types = ALL_NODE_TYPES }: Props = $props();

	function toggleLabel(type: NodeType, visible: boolean): string {
		const label = NODE_TYPE_LABELS[type].toLowerCase();

		return visible ? `Hide ${label}` : `Show ${label}`;
	}
</script>

{#each types as type (type)}
	{@const visible = graph.display.isTypeVisible(type)}
	{@const count = graph.display.typeCounts[type]}
	<ControlPanelButton
		pressed={visible}
		disabled={graph.data.isEmpty || count === 0}
		onclick={() => graph.display.toggleType(type)}
	>
		{toggleLabel(type, visible)}
	</ControlPanelButton>
{/each}
