import type { NodeType } from '../types';

import type { ParsedNodeId } from '../stores/types';

export function parseNodeId(id: string): ParsedNodeId {
	const [type, rawId] = id.split(':');

	if (!type || !rawId) return { type: 'artist', discogsId: null };

	const discogsId = Number(rawId);

	return {
		type: type as NodeType,
		discogsId: Number.isNaN(discogsId) ? null : discogsId
	};
}
