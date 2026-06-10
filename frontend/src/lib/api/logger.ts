const FALLBACK_API_URL = 'https://ai-for-developers-project-386-y0w1.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;
const LOG_REQUESTS = import.meta.env.VITE_LOG_API_REQUESTS === 'true';

export function logApiRequest(method: string, url: string, headers?: Record<string, string>, body?: string) {
	if (!LOG_REQUESTS) return;
	console.log(`[API ${method}] ${url}`);
	if (headers) console.log('[API Headers]', headers);
	if (body) console.log('[API Body]', body);
	if (url.includes('?')) console.log('[API Query Params]', url.split('?')[1]);
}

export function logApiResponse(method: string, url: string, status: number) {
	if (!LOG_REQUESTS) return;
	console.log(`[API Response ${method}] ${url} - ${status}`);
}

export { API_URL };
