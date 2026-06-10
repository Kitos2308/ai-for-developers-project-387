<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { themeStore } from '$lib/stores/theme.svelte';

	let darkMode = $state(false);

	$effect(() => {
		darkMode = themeStore.current === 'dark';
	});

	function handleToggle() {
		themeStore.toggle();
	}
</script>

<header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<a href="/" class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
				<svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				<span class="font-semibold text-lg">Calendar</span>
			</a>

			<nav class="flex items-center gap-2">
				<a href="/book">
					<Button variant="ghost" size="sm">Записаться</Button>
				</a>
				<a href="/admin">
					<Button variant="ghost" size="sm">Админка</Button>
				</a>
			<button
				onclick={handleToggle}
				class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
				aria-label="Toggle theme"
			>
					{#if darkMode}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					{:else}
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					{/if}
				</button>
			</nav>
		</div>
	</div>
</header>
