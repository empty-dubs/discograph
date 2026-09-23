import type { GraphNode } from '$lib/graph/types';

export type DiscoverEntitySectionId =
	| 'aliases'
	| 'members'
	| 'groups'
	| 'parent-label'
	| 'sublabels'
	| 'main-release'
	| 'linked-master'
	| 'artists'
	| 'labels'
	| 'credits'
	| 'companies';

export const ENTITY_SECTION_ORDER: { id: DiscoverEntitySectionId; title: string }[] = [
	{ id: 'aliases', title: 'Aliases' },
	{ id: 'members', title: 'Members' },
	{ id: 'groups', title: 'Groups' },
	{ id: 'parent-label', title: 'Parent label' },
	{ id: 'sublabels', title: 'Sublabels' },
	{ id: 'main-release', title: 'Main release' },
	{ id: 'linked-master', title: 'Master' },
	{ id: 'artists', title: 'Artists' },
	{ id: 'labels', title: 'Labels' },
	{ id: 'credits', title: 'Credits' },
	{ id: 'companies', title: 'Companies' }
];

export function formatMemberName(member: { name: string; active?: boolean }): string {
	return member.active === false ? `${member.name} (inactive)` : member.name;
}

export function getDiscoverEntitySectionVisibility(
	node: GraphNode
): Record<DiscoverEntitySectionId, boolean> {
	const isMasterOrRelease = node.type === 'master' || node.type === 'release';

	return {
		aliases: node.type === 'artist' && (node.aliases?.length ?? 0) > 0,
		members: node.type === 'artist' && (node.members?.length ?? 0) > 0,
		groups: node.type === 'artist' && (node.groups?.length ?? 0) > 0,
		'parent-label': node.type === 'label' && Boolean(node.parent_label),
		sublabels: node.type === 'label' && (node.sublabels?.length ?? 0) > 0,
		'main-release': node.type === 'master' && Boolean(node.main_release_info),
		'linked-master': node.type === 'release' && Boolean(node.linked_master),
		artists: isMasterOrRelease && (node.artists?.length ?? 0) > 0,
		labels: node.type === 'release' && (node.labels?.length ?? 0) > 0,
		credits: node.type === 'release' && (node.credits?.length ?? 0) > 0,
		companies: node.type === 'release' && (node.companies?.length ?? 0) > 0
	};
}

export function getDiscoverEntitySectionCount(
	node: GraphNode,
	sectionId: DiscoverEntitySectionId
): number | undefined {
	switch (sectionId) {
		case 'aliases':
			return node.aliases?.length;
		case 'members':
			return node.members?.length;
		case 'groups':
			return node.groups?.length;
		case 'sublabels':
			return node.sublabels?.length;
		case 'artists':
			return node.artists?.length;
		case 'labels':
			return node.labels?.length;
		case 'credits':
			return node.credits?.length;
		case 'companies':
			return node.companies?.length;
		default:
			return undefined;
	}
}

export function getVisibleEntitySections(
	node: GraphNode
): { id: DiscoverEntitySectionId; title: string }[] {
	const visibility = getDiscoverEntitySectionVisibility(node);

	return ENTITY_SECTION_ORDER.filter((section) => visibility[section.id]);
}
