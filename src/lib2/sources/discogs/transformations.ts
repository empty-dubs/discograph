import { documentStore } from './stores/documents.svelte';
import { getEntityDisplayName, getEntityId } from './compositions';
import { fetchEntityDocument } from './fetch';

import type { EntityType, ExternalUrl, SearchResult } from './types';

export function entityLabel(result: Pick<SearchResult, 'title' | 'name' | 'type'>): string {
	return result.title || result.name || `Unknown ${result.type}`;
}

// match patterns like URLs
// useful for cases like https://api.discogs.com/artists/191663
const URL_PATTERN = /(?:https?:\/\/[^\s]+|www\.[^\s]+)/i;

// match patterns like www.
const WWW_PATTERN = /^www\./i;

export function normalizeExternalUrl(url: string): ExternalUrl | undefined {
	if (!url) return;

	const match = url.trim().match(URL_PATTERN);

	if (!match) return;

	try {
		// normalize URL to HTTPS
		const matchedUrl = match[0].replace('http://', 'https://');

		return {
			href: WWW_PATTERN.test(matchedUrl) ? `https://${matchedUrl}` : matchedUrl,
			label: new URL(matchedUrl).hostname.replace(WWW_PATTERN, '')
		}
	} catch {
		return;
	}
}

const PREFIX_TO_ENTITY_TYPE: Record<string, EntityType> = {
	a: 'artist',
	l: 'label',
	m: 'master',
	r: 'release'
};

async function getReferenceEntityName(prefix: string, id: string): Promise<string> {
	const entityType = PREFIX_TO_ENTITY_TYPE[prefix];
	const externalId = parseInt(id);

	if (!entityType || !Number.isFinite(externalId)) return 'Unknown Entity';

	let document = await fetchEntityDocument(externalId, entityType);

	if (!document) {
		const entityId = getEntityId(entityType, externalId);

		document = documentStore.get(entityId);

		if (!document) return `Unknown ${entityType}`;
	}

	return getEntityDisplayName(document, entityType);
}

// maximum number of passes when normalizing profile text
const NESTING_DEPTH = 4;

// match patterns like [a1234567890] or [a=1234567890]
const PREFIX_ID_PATTERN = /\[(a|l|r|m)=*(\d+)\]/gi;

// match patterns like [a=Paul McCartney]
const NAMED_LINK_PATTERN = /\[(a|l|r|m)=([^\]]+)\]/gi;

// match patterns like [url=https://www.discogs.com/release/1234567890]Release Title[/url]
// useful for cases like https://api.discogs.com/artists/34278
const URL_TAG_PATTERN = /\[url=[^\]]+\]([^\[]*?)\[\/url\]/gi;

// match patterns like [b]Bold Text[/b]
const PAIRED_TAG_PATTERN = /\[(?:b|i|s|u)\]([\s\S]*?)\[\/(?:b|i|s|u)\]/gi;

// match patterns of extended whitespace
const MULTIPLE_SPACE_PATTERN = /[^\S\n]{2,}/g;

// match patterns like [ \t]+\n
const TRAILING_SPACE_TAB_NEWLINE_PATTERN = /[ \t]+\n/g;

export async function normalizeProfileText(text: string): Promise<string> {
	// strip paired tags used for boldface, italic, underline, and strikethrough
	// repeat up to nesting depth
	for (let depth = 0; depth < NESTING_DEPTH; depth += 1) {
		const innerText = text.replace(PAIRED_TAG_PATTERN, '$1');

		if (innerText === text) break;

		text = innerText;
	}

	// replace references like [a|l|m|r=123] with the entity name

	// extract entity references from text
	const entityReferenceMatchGroups = [...text.matchAll(PREFIX_ID_PATTERN)].map((match) => ({
		reference: match[0],
		prefix: match[1],
		id: match[2]
	}));

	// define map to store resolved reference entity names
	const referenceEntityNames = new Map<string, string>();

	// resolve entity names for each match group
	await Promise.all(
		entityReferenceMatchGroups.map(async (matchGroup) => {
			referenceEntityNames.set(matchGroup.reference, await getReferenceEntityName(matchGroup.prefix, matchGroup.id));
		})
	);

	// replace matched entity identifiers with resolved entity names
	for (const [reference, entityName] of referenceEntityNames) {
		text = text.replaceAll(reference, entityName);
	}

	text = text.replace(NAMED_LINK_PATTERN, '$2');
	text = text.replace(URL_TAG_PATTERN, '$1');
	text = text.replace(MULTIPLE_SPACE_PATTERN, ' ');
	text = text.replace(TRAILING_SPACE_TAB_NEWLINE_PATTERN, '\n');

	return text.trim();
}
