import { BLOCKED_DISCOGS_IDS } from './constants';

import type { EntityType } from './types';

export function isBlocked(type: EntityType, id: number): boolean {
	return BLOCKED_DISCOGS_IDS[type]?.has(id) ?? true;
}
