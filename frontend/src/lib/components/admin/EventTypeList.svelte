<script lang="ts">
	import type { EventType } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		eventTypes,
		onEdit,
		onDelete,
		...restProps
	}: {
		eventTypes: EventType[];
		onEdit: (eventType: EventType) => void;
		onDelete: (id: string) => void;
		[key: string]: any;
	} = $props();
</script>

<div {...restProps}>
	{#if eventTypes.length === 0}
		<Card padding="p-8 text-center">
			<p class="text-gray-500 dark:text-gray-400">Нет типов событий</p>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each eventTypes as eventType}
				<Card padding="p-4">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<h4 class="font-semibold text-gray-900 dark:text-gray-100">{eventType.title}</h4>
								<Badge variant="info">{eventType.durationMinutes} мин</Badge>
							</div>
							{#if eventType.description}
								<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{eventType.description}</p>
							{/if}
						</div>
						<div class="flex gap-2">
						<Button variant="secondary" size="sm" onclick={() => onEdit(eventType)}>Изменить</Button>
						<Button variant="danger" size="sm" onclick={() => onDelete(eventType.id)}>Удалить</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
