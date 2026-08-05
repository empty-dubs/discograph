import type { Label } from '$lib/discogs/types';

import type { DetailsTrackerContext } from '../types';

export function mergeLabelDetails(ctx: DetailsTrackerContext, nodeId: string, label: Label) {
	const existing = ctx.nodes.get(nodeId);

	if (!existing) return;

	const next = new Map(ctx.nodes);

	next.set(nodeId, {
		...existing,
		profile: label.profile,
		urls: label.urls,
		parent_label: label.parent_label
			? { id: label.parent_label.id, name: label.parent_label.name }
			: undefined,
		sublabels: label.sublabels?.map(({ id, name }) => ({ id, name }))
	});

	ctx.setNodes(next);
}
