import type { SearchResult } from './types';

export function entityLabel(result: Pick<SearchResult, 'title' | 'name' | 'type'>): string {
	return result.title || result.name || `Unknown ${result.type}`;
}
