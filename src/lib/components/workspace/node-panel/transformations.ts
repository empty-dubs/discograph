import { getArtist, getLabel, getRelease, getMaster } from "$lib/discogs/client";
import { getDisplayName } from "$lib/graph/operations/patches/compositions";

import type { NodePayload } from "$lib/discogs/types";
import type { NodeType } from "$lib/graph/types";

// match patterns like [a1234567890] or [a=1234567890]
const PREFIX_ID_PATTERN = /\[(a|l|r|m)=*(\d+)\]/gi;

// match patterns like [a=Paul McCartney]
const NAMED_LINK_PATTERN = /\[(a|l|r|m)=([^\]]+)\]/gi;

// match patterns like [url=https://www.discogs.com/release/1234567890]Release Title[/url]
const URL_TAG_PATTERN = /\[url=[^\]]+\]([^\[]*?)\[\/url\]/gi;

// match patterns like [b]Bold Text[/b]
const PAIRED_TAG_PATTERN = /\[(?:b|i|s|u)\]([\s\S]*?)\[\/(?:b|i|s|u)\]/gi;

// match patterns like [g1.0]
// const GUIDELINE_LINK_PATTERN = /\[g[\d.]+\]/gi;

// match patterns like [img=https://www.discogs.com/release/1234567890]
// const IMAGE_TAG_PATTERN = /\[img=[^\]]+\]/gi;

// match patterns of extended whitespace
const MULTIPLE_SPACE_PATTERN = /[^\S\n]{2,}/g;

// match patterns like [ \t]+\n
const TRAILING_SPACES_TABS_NEWLINE_PATTERN = /[ \t]+\n/g;

// match patterns not like URLs
const NON_URL_PATTERN = /(?:https?:\/\/[^\s]+|www\.[^\s]+)/i;

// match patterns like www.
const WWW_PATTERN = /^www\./i;

// maximum number of passes
const MAX_PASSES = 3;

const PREFIX_TO_TYPE: Record<string, NodeType> = {
	a: 'artist',
	l: 'label',
	r: 'release',
	m: 'master'
  };

async function getEntityName(prefix: string, id: string): Promise<string> {
	const type = PREFIX_TO_TYPE[prefix];
	const idNumber = parseInt(id);

	if (!type) return '';

	let payload: NodePayload | undefined = undefined;

	switch (type) {
		case 'artist':
			payload = await getArtist(idNumber);
			break;
		case 'label':
			payload = await getLabel(idNumber);
			break;
		case 'release':
			payload = await getRelease(idNumber);
			break;
		case 'master':
			payload = await getMaster(idNumber);
			break;
	}	

	return getDisplayName(payload, type);
}

export async function stripDiscogsWikiMarkup(text: string): Promise<string> {
	for (let pass = 0; pass < MAX_PASSES; pass += 1) {
		const innerText = text.replace(PAIRED_TAG_PATTERN, '$1');

		if (innerText === text) break;

		text = innerText;
	}

	const matches = [...text.matchAll(PREFIX_ID_PATTERN)].map(m => ({
		match: m[0],
		prefix: m[1],
		id: m[2]
	}));
	
	const resolved = new Map<string, string>();

	await Promise.all(
		matches.map(async ({ match, prefix, id }) => {
		resolved.set(match, await getEntityName(prefix, id));
		})
	);
	
	for (const [match, entityName] of resolved) {
		text = text.replaceAll(match, entityName);
	}

	text = text.replace(NAMED_LINK_PATTERN, '$2');
	text = text.replace(URL_TAG_PATTERN, '$1');

	text = text.replace(MULTIPLE_SPACE_PATTERN, ' ');
	text = text.replace(TRAILING_SPACES_TABS_NEWLINE_PATTERN, '\n');

	return text.trim();
}

export function parseDiscogsExternalUrl(raw: string): { href: string; display: string } | null {
	const match = raw.trim().match(NON_URL_PATTERN);

	if (!match) return null;

	let href = match[0];

	if (WWW_PATTERN.test(href)) href = `https://${href}`;

	try {
		const display = new URL(href).hostname.replace(WWW_PATTERN, '');

		return { href, display };
	} catch {
		return null;
	}
}
