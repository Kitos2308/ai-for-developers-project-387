<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getAdminEventTypes, getAdminBookings } from '$lib/api/admin';
	import type { EventType, Booking } from '$lib/types';

	let eventTypes = $state<EventType[]>([]);
	let bookings = $state<Booking[]>([]);
	let loading = $state(true);

	$effect(() => {
		async function loadData() {
			try {
				loading = true;
				[eventTypes, bookings] = await Promise.all([
					getAdminEventTypes(),
					getAdminBookings()
				]);
			} catch {
				eventTypes = [];
				bookings = [];
			} finally {
				loading = false;
			}
		}
		loadData();
	});
</script>

<Container>
	<div class="py-8">
		<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Админка</h1>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
			</div>
		{:else}
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
				<Card padding="p-6">
					<p class="text-sm text-gray-500 dark:text-gray-400">Типы событий</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{eventTypes.length}</p>
				</Card>
				<Card padding="p-6">
					<p class="text-sm text-gray-500 dark:text-gray-400">Бронирования</p>
					<p class="text-3xl font-bold text-gray-900 dark:text-gray-100">{bookings.length}</p>
				</Card>
			</div>

			<div class="grid sm:grid-cols-2 gap-4">
			<a href="/admin/event-types">
				<Card padding="p-6" class="cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
							<svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-gray-900 dark:text-gray-100">Типы событий</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">Управление типами встреч</p>
						</div>
					</div>
				</Card>
			</a>
			<a href="/admin/bookings">
				<Card padding="p-6" class="cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
							<svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
							</svg>
						</div>
						<div>
							<h3 class="font-semibold text-gray-900 dark:text-gray-100">Бронирования</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">Просмотр и управление записями</p>
						</div>
					</div>
				</Card>
			</a>
			</div>
		{/if}
	</div>
</Container>
