import { browser } from '$app/environment';

export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
}

class ToastStore {
	#toasts = $state<Toast[]>([]);
	#nextId = 0;

	get all() {
		return this.#toasts;
	}

	show(message: string, type: ToastType = 'error', duration = 4000) {
		const toast: Toast = { id: this.#nextId++, message, type };
		this.#toasts = [...this.#toasts, toast];
		if (browser) {
			setTimeout(() => this.dismiss(toast.id), duration);
		}
	}

	dismiss(id: number) {
		this.#toasts = this.#toasts.filter((t) => t.id !== id);
	}
}

export const toastStore = new ToastStore();
