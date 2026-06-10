<script lang="ts">
	import type { EventType } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';

	let {
		eventType,
		...restProps
	}: {
		eventType: EventType;
		[key: string]: any;
	} = $props();
</script>

<Card
	class="cursor-pointer hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
	padding="p-6"
	{...restProps}
>
	<div class="flex items-start justify-between">
		<div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
				{eventType.title}
			</h3>
			{#if eventType.description}
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{eventType.description}</p>
			{/if}
		</div>
		<Badge variant="info">{eventType.durationMinutes} мин</Badge>
	</div>
</Card>
