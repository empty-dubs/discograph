import { BLOCKED_DISCOGS_IDS } from './constants';

import type { SearchType } from './types';

export function isBlocked(type: SearchType, id: number): boolean {
	return BLOCKED_DISCOGS_IDS[type]?.has(id) ?? false;
}
