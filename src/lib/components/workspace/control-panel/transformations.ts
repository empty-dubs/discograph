import type { GraphNode } from "$lib/graph/types";

function buildReleaseTitleLabel(
	title: string | undefined,
	artist?: string | undefined,
	year?: number | string
): string {
	if (!title) return '';

	const artistName = artist?.trim();
	const releaseYear = year != null && year !== '' && year !== '0' ? year : null;

	return `${artistName ? `${artistName} - ` : ''}${title}${releaseYear ? ` (${releaseYear})` : ''}`;
}


export function releaseTitle(node: GraphNode): string {
	return node.title ?? node.displayName ?? node.name ?? 'Unknown';
}

export function releaseListRowText(node: GraphNode): { label: string; query: string } {
	const title = releaseTitle(node);
	const label = buildReleaseTitleLabel(title, node.meta?.artistName, node.meta?.year);
	const query = title;

	return { label, query };
}
