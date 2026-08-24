import { json, error } from '@sveltejs/kit';
import { DiscogsApiError, extractRateLimitHeaders, fetchDiscogs } from '$lib/server/discogs';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async ({ params, url }) => {
	const path = params.path;
	if (!path) {
		error(400, 'Missing API path');
	}

	try {
		const { data, headers } = await fetchDiscogs(path, url.searchParams);
		return json(data, { headers: extractRateLimitHeaders(headers) });
	} catch (err) {
		if (err instanceof DiscogsApiError) {
			error(err.status, err.message);
		}
		throw err;
	}
};
