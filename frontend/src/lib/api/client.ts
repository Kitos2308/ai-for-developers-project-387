import { toastStore } from '$lib/stores/toast.svelte';

const FALLBACK_API_URL = 'https://ai-for-developers-project-386-y0w1.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || FALLBACK_API_URL;

async function extractError(response: Response): Promise<string> {
	try {
		const body = await response.json();
		if (typeof body.detail === 'string') return body.detail;
		if (typeof body.message === 'string') return body.message;
		if (Array.isArray(body.detail)) {
			return body.detail.map((d: { msg?: string; message?: string }) => d.msg || d.message).join('; ');
		}
	} catch {}
	return `Ошибка сервера: ${response.status} ${response.statusText}`;
}

export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
	const fullUrl = API_URL ? `${API_URL}${url}` : url;
	let response: Response;
	try {
		response = await fetch(fullUrl, {
			headers: { 'Content-Type': 'application/json' },
			...options
		});
	} catch (e) {
		const message = e instanceof TypeError ? 'Сервер недоступен. Проверьте подключение.' : 'Неизвестная ошибка сети';
		toastStore.show(message, 'error');
		throw e;
	}
	if (!response.ok) {
		const message = await extractError(response);
		toastStore.show(message, 'error');
		throw new Error(message);
	}
	if (response.status === 204) return undefined as T;
	return response.json();
}
