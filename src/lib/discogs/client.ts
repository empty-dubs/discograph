import { API_BASE } from './constants';

import type {
	Artist,
	ArtistReleasesResponse,
	Label,
	LabelReleasesResponse,
	Master,
	MasterVersionsResponse,
	RateLimitInfo,
	Release,
	SearchResponse,
	SearchType
} from './types';

function parseRateLimitHeaders(headers: Headers): RateLimitInfo {
	const limit = headers.get('x-discogs-ratelimit');
	const used = headers.get('x-discogs-ratelimit-used');
	const remaining = headers.get('x-discogs-ratelimit-remaining');

	return {
		limit: limit ? Number(limit) : null,
		used: used ? Number(used) : null,
		remaining: remaining ? Number(remaining) : null
	};
}

export class DiscogsClientError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
		this.name = 'DiscogsClientError';
	}
}

let lastRateLimit: RateLimitInfo = { limit: null, used: null, remaining: null };

export function getLastRateLimit(): RateLimitInfo {
	return lastRateLimit;
}

async function request<T>(
	path: string,
	params?: Record<string, string | number | undefined>
): Promise<T> {
	const url = new URL(`${API_BASE}/${path.replace(/^\//, '')}`, window.location.origin);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== '') {
				url.searchParams.set(key, String(value));
			}
		}
	}

	const response = await fetch(url);

	lastRateLimit = parseRateLimitHeaders(response.headers);

	if (!response.ok) {
		let message = `Request failed (${response.status})`;

		try {
			const body = await response.json();

			if (body && typeof body === 'object' && 'message' in body) {
				message = String((body as { message: string }).message);
			}
		} catch {
			// ignore parse errors
		}
		throw new DiscogsClientError(message, response.status);
	}

	return response.json() as Promise<T>;
}

export function search(query: string, type?: SearchType, page: number = 1) {
	return request<SearchResponse>('database/search', { q: query, type, page, per_page: 25 });
}

export function getArtist(id: number) {
	return request<Artist>(`artists/${id}`);
}

export function getArtistReleases(id: number, page: number = 1) {
	return request<ArtistReleasesResponse>(`artists/${id}/releases`, { page, per_page: 50 });
}

export function getLabel(id: number) {
	return request<Label>(`labels/${id}`);
}

export function getLabelReleases(id: number, page: number = 1) {
	return request<LabelReleasesResponse>(`labels/${id}/releases`, { page, per_page: 50 });
}

export function getRelease(id: number) {
	return request<Release>(`releases/${id}`);
}

export function getMaster(id: number) {
	return request<Master>(`masters/${id}`);
}

export function getMasterVersions(id: number, page: number = 1) {
	return request<MasterVersionsResponse>(`masters/${id}/versions`, { page, per_page: 50 });
}
