<script lang="ts">
	import type { Booking, EventType } from '$lib/types';
	import { formatDateTimeMSK } from '$lib/utils/date';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let {
		bookings,
		eventTypes,
		onEdit,
		onDelete,
		...restProps
	}: {
		bookings: Booking[];
		eventTypes: EventType[];
		onEdit: (booking: Booking) => void;
		onDelete: (id: string) => void;
		[key: string]: any;
	} = $props();

	let editingBooking = $state<Booking | null>(null);
	let showEditModal = $state(false);
	let guestName = $state('');
	let guestEmail = $state('');
	let notes = $state('');

	function openEdit(booking: Booking) {
		editingBooking = booking;
		guestName = booking.guestName ?? '';
		guestEmail = booking.guestEmail ?? '';
		notes = booking.notes ?? '';
		showEditModal = true;
	}

	function saveEdit() {
		if (!editingBooking) return;
		onEdit({ ...editingBooking, guestName, guestEmail, notes });
		showEditModal = false;
	}

	function getEventTitle(eventTypeId: string): string {
		return eventTypes.find((et) => et.id === eventTypeId)?.title ?? 'Неизвестно';
	}
</script>

<div {...restProps}>
	{#if bookings.length === 0}
		<Card padding="p-8 text-center">
			<p class="text-gray-500 dark:text-gray-400">Нет бронирований</p>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each bookings as booking}
				<Card padding="p-4">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-center gap-2 mb-1">
								<h4 class="font-semibold text-gray-900 dark:text-gray-100">{getEventTitle(booking.eventTypeId)}</h4>
								<Badge variant="success">Подтверждено</Badge>
							</div>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{formatDateTimeMSK(booking.startTime)}
							</p>
							{#if booking.guestName || booking.guestEmail}
								<p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
									{booking.guestName} {booking.guestEmail ? `(${booking.guestEmail})` : ''}
								</p>
							{/if}
							{#if booking.notes}
								<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">{booking.notes}</p>
							{/if}
						</div>
						<div class="flex gap-2">
						<Button variant="secondary" size="sm" onclick={() => openEdit(booking)}>Изменить</Button>
						<Button variant="danger" size="sm" onclick={() => onDelete(booking.id)}>Удалить</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}

	<Modal open={showEditModal} title="Редактировать бронирование" onClose={() => showEditModal = false}>
		<div class="space-y-4">
			<Input label="Имя" bind:value={guestName} />
			<Input label="Email" type="email" bind:value={guestEmail} />
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заметки</label>
				<textarea
					bind:value={notes}
					rows="3"
					class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
				></textarea>
			</div>
			<div class="flex gap-3 pt-2">
			<Button variant="secondary" class="flex-1" onclick={() => showEditModal = false}>Отмена</Button>
			<Button variant="primary" class="flex-1" onclick={saveEdit}>Сохранить</Button>
			</div>
		</div>
	</Modal>
</div>
