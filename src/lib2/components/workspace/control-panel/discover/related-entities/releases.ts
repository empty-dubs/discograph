function releaseRowLabel(
	title: string,
	artist?: string,
	year?: number | string
): string {
	const artistName = artist?.trim();
	const releaseYear = year != null && year !== '' && year !== '0' ? year : null;

	return `${artistName ? `${artistName} - ` : ''}${title}${releaseYear ? ` (${releaseYear})` : ''}`;
}

export function releaseRowDisplay(params: {
	title: string;
	artist?: string;
	year?: number | string;
}): { label: string; query: string } {
	const query = params.title.trim() || 'Unknown';

	return {
		label: releaseRowLabel(query, params.artist, params.year),
		query
	};
}
