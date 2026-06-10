<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import BookingList from '$lib/components/admin/BookingList.svelte';
	import { getAdminBookings, updateBooking, deleteBooking } from '$lib/api/admin';
	import { getAdminEventTypes } from '$lib/api/admin';
	import type { Booking, EventType } from '$lib/types';

	let bookings = $state<Booking[]>([]);
	let eventTypes = $state<EventType[]>([]);
	let loading = $state(true);

	$effect(() => {
		async function loadData() {
			try {
				loading = true;
				[bookings, eventTypes] = await Promise.all([
					getAdminBookings(),
					getAdminEventTypes()
				]);
			} catch {
				bookings = [];
				eventTypes = [];
			} finally {
				loading = false;
			}
		}
		loadData();
	});

	async function handleEdit(booking: Booking) {
		try {
			await updateBooking(booking.id, {
				guestName: booking.guestName,
				guestEmail: booking.guestEmail,
				notes: booking.notes
			});
			bookings = await getAdminBookings();
		} catch (e) {
			console.error(e);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Удалить это бронирование?')) return;
		try {
			await deleteBooking(id);
			bookings = await getAdminBookings();
		} catch (e) {
			console.error(e);
		}
	}
</script>

<Container>
	<div class="py-8">
		<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Бронирования</h1>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
			</div>
		{:else}
			<BookingList
				{bookings}
				{eventTypes}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		{/if}
	</div>
</Container>
