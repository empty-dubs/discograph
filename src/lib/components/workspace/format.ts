const NAMED_LINK_PATTERN = /\[(?:a|l|r|m)=([^\]]+)\]/gi;
const URL_TAG_PATTERN = /\[url=[^\]]+\]([^\[]*?)\[\/url\]/gi;
const PAIRED_TAG_PATTERN = /\[(?:b|i|s|u)\]([\s\S]*?)\[\/(?:b|i|s|u)\]/gi;
const ID_ONLY_LINK_PATTERN = /\[(?:a|l|r|m)\d+\]/gi;
const GUIDELINE_LINK_PATTERN = /\[g[\d.]+\]/gi;
const IMAGE_TAG_PATTERN = /\[img=[^\]]+\]/gi;

export function stripDiscogsWikiMarkup(text: string): string {
	text = text.replace(NAMED_LINK_PATTERN, '$1');
	text = text.replace(URL_TAG_PATTERN, '$1');

	for (let pass = 0; pass < 3; pass += 1) {
		const next = text.replace(PAIRED_TAG_PATTERN, '$1');

		if (next === text) break;
		text = next;
	}

	text = text.replace(ID_ONLY_LINK_PATTERN, '');
	text = text.replace(GUIDELINE_LINK_PATTERN, '');
	text = text.replace(IMAGE_TAG_PATTERN, '');
	text = text.replace(/[^\S\n]{2,}/g, ' ');
	text = text.replace(/[ \t]+\n/g, '\n');

	return text.trim();
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
