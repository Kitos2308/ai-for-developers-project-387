<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import EventTypeCard from '$lib/components/booking/EventTypeCard.svelte';
	import { getEventTypes } from '$lib/api/public';
	import type { EventType } from '$lib/types';

	let eventTypes = $state<EventType[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		async function loadEventTypes() {
			try {
				loading = true;
				eventTypes = await getEventTypes();
			} catch (e) {
				error = e instanceof Error ? e.message : 'Не удалось загрузить типы событий';
			} finally {
				loading = false;
			}
		}
		loadEventTypes();
	});
</script>

<Container>
	<div class="py-8">
		<Card padding="p-6 sm:p-8" class="mb-8">
			<div class="flex items-center gap-4 mb-4">
				<div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
					<svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
				</div>
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Tota</h2>
					<p class="text-sm text-gray-500 dark:text-gray-400">Host</p>
				</div>
			</div>
			<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
				Выберите тип события
			</h1>
			<p class="text-gray-500 dark:text-gray-400">
				Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
			</p>
		</Card>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
			</div>
		{:else if error}
			<div class="text-center py-12 text-red-500">{error}</div>
		{:else if eventTypes.length === 0}
			<div class="text-center py-12 text-gray-500 dark:text-gray-400">Нет доступных типов событий</div>
		{:else}
			<div class="grid sm:grid-cols-2 gap-4">
				{#each eventTypes as eventType}
					<a href="/book/{eventType.id}">
						<EventTypeCard {eventType} />
					</a>
				{/each}
			</div>
		{/if}
	</div>
</Container>
