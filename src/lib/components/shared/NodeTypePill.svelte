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
	class="node-type-surface box-border inline-flex w-[4.5rem] shrink-0 items-center justify-center rounded text-sm capitalize {className}"
	style:--badge-color={NODE_COLORS[type]}
>
	{type}
</span>
