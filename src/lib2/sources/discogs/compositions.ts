export function getEntityId(type: string, externalId: number | string): string {
	return `discogs:${type}:${externalId}`;
}

export function getRelationshipId(source: string, type: string, target: string): string {
	return `${source}|${type}|${target}`;
}
