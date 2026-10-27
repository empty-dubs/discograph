import type { SearchResult } from './types';

export function dedupeById<T extends { id: number }>(items: T[]): T[] {
	const seen = new Set<number>();
	const result: T[] = [];

	for (const item of items) {
		if (seen.has(item.id)) continue;

		seen.add(item.id);
		result.push(item);
	}

	return result;
}

export function entityLabel(result: Pick<SearchResult, 'title' | 'name' | 'type'>): string {
	return result.title || result.name || `Unknown ${result.type}`;
}
