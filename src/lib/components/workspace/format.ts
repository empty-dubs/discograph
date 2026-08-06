const NAMED_LINK_PATTERN = /\[(?:a|l|r|m)=([^\]]+)\]/gi;
const URL_TAG_PATTERN = /\[url=[^\]]+\]([^\[]*?)\[\/url\]/gi;
const PAIRED_TAG_PATTERN = /\[(?:b|i|s|u)\]([\s\S]*?)\[\/(?:b|i|s|u)\]/gi;
const ID_ONLY_LINK_PATTERN = /\[(?:a|l|r|m)\d+\]/gi;
const GUIDELINE_LINK_PATTERN = /\[g[\d.]+\]/gi;
const IMAGE_TAG_PATTERN = /\[img=[^\]]+\]/gi;

export function stripDiscogsWikiMarkup(text: string): string {
	let result = text;

	result = result.replace(NAMED_LINK_PATTERN, '$1');
	result = result.replace(URL_TAG_PATTERN, '$1');

	for (let pass = 0; pass < 3; pass += 1) {
		const next = result.replace(PAIRED_TAG_PATTERN, '$1');

		if (next === result) break;
		result = next;
	}

	result = result.replace(ID_ONLY_LINK_PATTERN, '');
	result = result.replace(GUIDELINE_LINK_PATTERN, '');
	result = result.replace(IMAGE_TAG_PATTERN, '');
	result = result.replace(/[^\S\n]{2,}/g, ' ');
	result = result.replace(/[ \t]+\n/g, '\n');

	return result.trim();
}

export function parseDiscogsExternalUrl(raw: string): { href: string; display: string } | null {
	const match = raw.trim().match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/i);
	if (!match) return null;

	let href = match[0].replace(/[.,;:!?)]+$/, '');
	if (/^www\./i.test(href)) href = `https://${href}`;

	try {
		const display = new URL(href).hostname.replace(/^www\./i, '');
		return { href, display };
	} catch {
		return null;
	}
}

export function formatUrlDomain(url: string): string {
	return parseDiscogsExternalUrl(url)?.display ?? url;
}
