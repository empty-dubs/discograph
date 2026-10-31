export function collectDescendants(
	rootId: string,
	parentChildMap: Map<string, Set<string>>,
	childParentMap: Map<string, Set<string>>
): Set<string> {
	const descendants = new Set<string>();

	const visit = (id: string) => {
		const children = parentChildMap.get(id);

		if (!children) return;

		for (const child of children) {
			const parents = childParentMap.get(child);

			if (!parents) continue;

			if (parents.size > 1) {
				childParentMap.get(child)?.delete(id);
				continue;
			}

			if (descendants.has(child)) continue;

			descendants.add(child);

			visit(child);
		}
	};

	visit(rootId);

	return descendants;
}
