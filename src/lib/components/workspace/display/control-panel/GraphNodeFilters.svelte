<script lang="ts">
	import { ALL_NODE_TYPES, NODE_TYPE_LABELS } from '$lib/graph/constants';
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
				disabled={graph.data.isEmpty ||
					count === 0 ||
					(visible && graph.display.visibleTypes.size === 1)}
				onchange={(e) => graph.display.setTypeVisible(type, e.currentTarget.checked)}
			/>
			{NODE_TYPE_LABELS[type]}
		</label>
	{/each}
</div>
