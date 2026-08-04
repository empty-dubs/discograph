<script lang="ts">
	import NodeDetailRow from './NodeDetailRow.svelte';

	import type { GraphNode } from '$lib/graph/types';

	interface Props {
		node: GraphNode;
	}

	let { node }: Props = $props();

	function formatMemberName(member: { name: string; active?: boolean }): string {
		return member.active === false ? `${member.name} (inactive)` : member.name;
	}
</script>

{#if node.realname}
	<NodeDetailRow label="Real name">{node.realname}</NodeDetailRow>
{/if}

{#if node.namevariations?.length}
	<NodeDetailRow label="Name variations">{node.namevariations.join(', ')}</NodeDetailRow>
{/if}

{#if node.members?.length}
	<NodeDetailRow label="Members">{node.members.map(formatMemberName).join(', ')}</NodeDetailRow>
{/if}

{#if node.groups?.length}
	<NodeDetailRow label="Groups">{node.groups.map((group) => group.name).join(', ')}</NodeDetailRow>
{/if}
