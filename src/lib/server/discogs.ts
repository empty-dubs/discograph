import { env } from '$env/dynamic/private';
import { acquireRateLimitSlot } from './rate-limiter';

const DISCOGS_BASE = 'https://api.discogs.com';

export class DiscogsApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public body?: unknown
	) {
		super(message);
		this.name = 'DiscogsApiError';
	}
}

function buildAuthorization(): string {
	const token = env.DISCOGS_TOKEN;
	const consumerKey = env.DISCOGS_CONSUMER_KEY;
	const consumerSecret = env.DISCOGS_CONSUMER_SECRET;

	if (token) {
		return `Discogs token=${token}`;
	}

	if (consumerKey && consumerSecret) {
		return `Discogs key=${consumerKey}, secret=${consumerSecret}`;
	}

	throw new DiscogsApiError(
		'Discogs credentials not configured. Set DISCOGS_TOKEN or DISCOGS_CONSUMER_KEY + DISCOGS_CONSUMER_SECRET in .env',
		500
	);
}

export async function fetchDiscogs(
	path: string,
	searchParams?: URLSearchParams
): Promise<{ data: unknown; headers: Headers }> {
	await acquireRateLimitSlot();

	const url = new URL(`${DISCOGS_BASE}/${path.replace(/^\//, '')}`);
	if (searchParams) {
		url.search = searchParams.toString();
	}

	const response = await fetch(url, {
		headers: {
			Authorization: buildAuthorization(),
			'User-Agent': env.DISCOGS_USER_AGENT,
			Accept: 'application/vnd.discogs.v2.discogs+json'
		}
	});

	const text = await response.text();
	let data: unknown = null;

	if (text) {
		try {
			data = JSON.parse(text);
		} catch {
			data = text;
		}
	}

	if (!response.ok) {
		throw new DiscogsApiError(
			typeof data === 'object' && data !== null && 'message' in data
				? String((data as { message: string }).message)
				: `Discogs API error (${response.status})`,
			response.status,
			data
		);
	}

	return { data, headers: response.headers };
}

export function extractRateLimitHeaders(headers: Headers): Record<string, string> {
	const headerPayload: Record<string, string> = {};

	for (const key of [
		'x-discogs-ratelimit',
		'x-discogs-ratelimit-used',
		'x-discogs-ratelimit-remaining'
	]) {
		const value = headers.get(key);

		if (value !== null) {
			headerPayload[key] = value;
		}
	}
	return headerPayload;
}
