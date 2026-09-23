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
	class="h-2.5 w-2.5 shrink-0 rounded-full {className}"
	style:background={NODE_COLORS[type]}
	aria-hidden="true"
></span>
