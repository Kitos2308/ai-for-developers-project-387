import type { Handle } from '@sveltejs/kit';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const API_PREFIX = '/api';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith(API_PREFIX + '/')) {
		const targetPath = event.url.pathname.slice(API_PREFIX.length);
		const targetUrl = `${BACKEND_URL}${targetPath}${event.url.search}`;

		const headers = new Headers(event.request.headers);
		headers.delete('host');

		const init: RequestInit = {
			method: event.request.method,
			headers
		};

		if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
			init.body = await event.request.text();
		}

		try {
			const response = await fetch(targetUrl, init);
			const responseHeaders = new Headers(response.headers);
			responseHeaders.delete('transfer-encoding');

			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: responseHeaders
			});
		} catch {
			return new Response(JSON.stringify({ detail: 'Сервер недоступен' }), {
				status: 502,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	return resolve(event);
};