<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
</script>

<Container>
	<div class="py-12 sm:py-20">
		<div class="grid md:grid-cols-2 gap-8 items-center">
			<div>
				<span class="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-4">
					БЫСТРАЯ ЗАПИСЬ НА ЗВОНОК
				</span>
				<h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
					Calendar
				</h1>
				<p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
					Забронируйте встречу за минуту: выберите тип события и удобное время.
				</p>
			<a href="/book">
				<Button variant="primary" size="lg">
					<span class="flex items-center gap-2">
						Записаться
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</span>
				</Button>
			</a>
			</div>

			<Card padding="p-8">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Возможности</h2>
				<ul class="space-y-3 text-gray-600 dark:text-gray-400">
					<li class="flex items-start gap-2">
						<span class="text-primary-500 mt-1">•</span>
						<span>Выбор типа события и удобного времени для встречи.</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary-500 mt-1">•</span>
						<span>Быстрое бронирование с подтверждением и дополнительными заметками.</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-primary-500 mt-1">•</span>
						<span>Управление типами встреч и просмотр предстоящих записей в админке.</span>
					</li>
				</ul>
			</Card>
		</div>
	</div>
</Container>
