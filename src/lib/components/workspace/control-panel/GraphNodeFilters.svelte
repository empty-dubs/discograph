<script lang="ts">
	import { ALL_NODE_TYPES } from '$lib/graph/constants';
	import { graph } from '$lib/graph/graph';

	import type { NodeType } from '$lib/graph/types';

	interface Props {
		types?: NodeType[];
	}

	let { types = ALL_NODE_TYPES }: Props = $props();
</script>

<div class="flex flex-col">
	{#each types as type (type)}
		{@const visible = graph.display.isTypeVisible(type)}
		{@const count = graph.display.typeCounts[type]}
		<label class="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
			<input
				type="checkbox"
				class="accent-accent size-4 rounded border-border disabled:cursor-not-allowed disabled:opacity-50"
				checked={visible}
				disabled={
					graph.data.isEmpty
					|| count === 0
					|| (visible && graph.data.nodeList.filter((n) => n.type === type).length === 1)
				}
				onchange={(e) => graph.display.setTypeVisible(type, e.currentTarget.checked)}
			/>
			Show {type}s
		</label>
	{/each}
</div>
