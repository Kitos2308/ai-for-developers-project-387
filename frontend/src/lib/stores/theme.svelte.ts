import { browser } from '$app/environment';

const THEME_KEY = 'theme';

class ThemeStore {
	#theme = $state<'light' | 'dark'>(
		browser ? (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light' : 'light'
	);

	get current() {
		return this.#theme;
	}

	toggle() {
		this.#theme = this.#theme === 'dark' ? 'light' : 'dark';
		this.#apply();
	}

	#apply() {
		if (browser) {
			localStorage.setItem(THEME_KEY, this.#theme);
			document.documentElement.classList.toggle('dark', this.#theme === 'dark');
		}
	}
}

export const themeStore = new ThemeStore();

if (browser) {
	themeStore.current;
	document.documentElement.classList.toggle('dark', themeStore.current === 'dark');
}
