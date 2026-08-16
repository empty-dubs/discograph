import type { GraphLink } from '../types';

export function collectDescendants(
	rootId: string,
	knownChildren: Map<string, Set<string>>
): Set<string> {
	const descendants = new Set<string>();

	const visit = (id: string) => {
		const children = knownChildren.get(id);

		if (!children) return;

		for (const childId of children) {
			if (descendants.has(childId)) continue;

			descendants.add(childId);

			visit(childId);
		}
	};

	visit(rootId);

	return descendants;
}

export function findRemovableDescendants(
	nodeId: string,
	descendants: Set<string>,
	links: GraphLink[]
): Set<string> {
	const toRemove = new Set<string>();

	for (const id of descendants) {
		const hasExternalLink = links.some((link) => {
			const isEndpoint = link.source === id || link.target === id;
			if (!isEndpoint) return false;
			const other = link.source === id ? link.target : link.source;
			return other !== nodeId && !descendants.has(other);
		});

		if (!hasExternalLink) {
			toRemove.add(id);
		}
	}

	return toRemove;
}
