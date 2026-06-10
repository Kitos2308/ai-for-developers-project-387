<script lang="ts">
	import type { Slot } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { formatDateTimeMSK } from '$lib/utils/date';

	let {
		slot,
		onBack,
		onSubmit,
		...restProps
	}: {
		slot: Slot;
		onBack: () => void;
		onSubmit: (data: { guestName?: string; guestEmail?: string; notes?: string }) => void;
		[key: string]: any;
	} = $props();

	let guestName = $state('');
	let guestEmail = $state('');
	let notes = $state('');
	let submitting = $state(false);

	function handleSubmit() {
		submitting = true;
		onSubmit({ guestName, guestEmail, notes });
	}
</script>

<Card padding="p-6 max-w-lg mx-auto" {...restProps}>
	<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Подтверждение бронирования</h3>

	<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
		<p class="text-sm text-gray-500 dark:text-gray-400">Выбранное время</p>
		<p class="text-lg font-semibold text-gray-900 dark:text-gray-100">
			{formatDateTimeMSK(slot.startTime)}
		</p>
	</div>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
		<Input label="Имя" placeholder="Ваше имя" bind:value={guestName} />
		<Input label="Email" type="email" placeholder="your@email.com" bind:value={guestEmail} />
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заметки</label>
			<textarea
				bind:value={notes}
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors resize-none"
				placeholder="Дополнительная информация..."
			></textarea>
		</div>

		<div class="flex gap-3 pt-4">
			<Button type="button" variant="secondary" class="flex-1" onclick={onBack}>Назад</Button>
			<Button type="submit" variant="primary" class="flex-1" disabled={submitting}>
				{submitting ? 'Бронирование...' : 'Забронировать'}
			</Button>
		</div>
	</form>
</Card>
