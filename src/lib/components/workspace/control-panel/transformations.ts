import type { GraphNode } from "$lib/graph/types";

function buildReleaseTitleSearchQuery(
	title: string | undefined,
	artistName?: string,
	year?: number | string
): string {
	if (!title) return '';

	const name = artistName?.trim();

	if (!name) return title;

	return `${name} - ${title}${year != null && year !== '' ? ` (${year})` : ''}`;
}


export function releaseTitle(node: GraphNode): string {
	return node.title ?? node.displayName ?? node.name ?? 'Unknown';
}

export function releaseListRowText(node: GraphNode): { label: string; query: string } {
	const title = releaseTitle(node);
	const query = buildReleaseTitleSearchQuery(title, node.meta?.artistName, node.meta?.year);
	const label = query;

	return { label, query };
}
