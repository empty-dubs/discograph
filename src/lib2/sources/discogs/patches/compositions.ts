import type { SearchResult } from "../types";

export function nodeId(type: string, externalId: number | string): string {
	return `discogs:${type}:${externalId}`;
}

export function linkId(source: string, type: string, target: string): string {
	return `${source}|${type}|${target}`;
}

export function searchResultLabel(result: SearchResult): string {
	return result.title || result.name || `Unknown ${result.type}`;
}