<script lang="ts">
	import type { EventType, CreateEventTypeRequest, UpdateEventTypeRequest } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let {
		eventType,
		onSave,
		onCancel,
		...restProps
	}: {
		eventType?: EventType;
		onSave: (data: CreateEventTypeRequest | UpdateEventTypeRequest) => void;
		onCancel: () => void;
		[key: string]: any;
	} = $props();

	let title = $state(eventType?.title ?? '');
	let description = $state(eventType?.description ?? '');
	let durationMinutes = $state(eventType?.durationMinutes?.toString() ?? '30');

	function handleSubmit() {
		if (!title || (!eventType && !durationMinutes)) return;
		const data: Record<string, any> = {
			title,
			description: description || undefined,
		};
		if (!eventType) {
			data.durationMinutes = parseInt(durationMinutes);
		}
		onSave(data);
	}
</script>

<Card padding="p-6" {...restProps}>
	<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
		{eventType ? 'Редактировать тип события' : 'Новый тип события'}
	</h3>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
		<Input label="Название" placeholder="Например: Встреча 30 минут" bind:value={title} required />
		<div>
			<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
			<textarea
				bind:value={description}
				rows="3"
				class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors resize-none"
				placeholder="Краткое описание встречи..."
			></textarea>
		</div>
		<Input label="Длительность (минуты)" type="number" placeholder="30" bind:value={durationMinutes} required min="5" max="180" disabled={!!eventType} />
		{#if eventType}
			<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Длительность нельзя изменить после создания — это сломает существующие бронирования</p>
		{/if}

		<div class="flex gap-3 pt-4">
			<Button type="button" variant="secondary" class="flex-1" onclick={onCancel}>Отмена</Button>
			<Button type="submit" variant="primary" class="flex-1">Сохранить</Button>
		</div>
	</form>
</Card>
