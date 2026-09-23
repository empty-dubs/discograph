<script lang="ts">
	import { NODE_COLORS } from '$lib/graph/constants';

	import type { NodeType } from '$lib/graph/types';

	interface Props {
		type: NodeType;
		class?: string;
	}

	let { type, class: className = '' }: Props = $props();
</script>

<span
	class="node-type-surface inline-block shrink-0 rounded px-1.5 py-0 text-xs capitalize {className}"
	style:--badge-color={NODE_COLORS[type]}
>
	{type}
</span>
