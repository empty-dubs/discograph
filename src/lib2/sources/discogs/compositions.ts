export function nodeId(type: string, externalId: number | string): string {
	return `discogs:${type}:${externalId}`;
}

export function linkId(source: string, type: string, target: string): string {
	return `${source}|${type}|${target}`;
}
