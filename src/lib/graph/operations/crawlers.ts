export function collectDescendants(
	rootId: string,
	knownChildren: Map<string, Set<string>>
): Set<string> {
	const descendants = new Set<string>();

	const visit = (id: string) => {
		const children = knownChildren.get(id);

		if (!children) return;

		for (const child of children) {
			if (descendants.has(child)) continue;

			descendants.add(child);

			visit(child);
		}
	};

	visit(rootId);

	return descendants;
}
