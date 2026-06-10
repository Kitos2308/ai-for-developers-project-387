<script lang="ts">
	import type { CalendarDaySlots, Slot } from '$lib/types';
	import { formatDate, formatMonthYear, getDaysInMonth, getFirstDayOfMonth, formatSlotTime } from '$lib/utils/date';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { getCalendar, getSlots } from '$lib/api/public';

	let {
		eventTypeId,
		durationMinutes,
		onDateSelect,
		onSlotSelect,
		onContinue,
		selectedDate,
		selectedSlot,
	}: {
		eventTypeId: string;
		durationMinutes: number;
		onDateSelect: (date: string) => void;
		onSlotSelect: (slot: Slot) => void;
		onContinue: () => void;
		selectedDate?: string;
		selectedSlot?: Slot;
	} = $props();

	let currentDate = $state(new Date());
	let calendarDays = $state<CalendarDaySlots[]>([]);
	let slots = $state<Slot[]>([]);
	let loading = $state(false);

	const year = $derived(currentDate.getFullYear());
	const month = $derived(currentDate.getMonth());
	const daysInMonth = $derived(getDaysInMonth(year, month));
	const firstDay = $derived(getFirstDayOfMonth(year, month));

	$effect(() => {
		async function loadCalendar() {
			if (!eventTypeId) return;
			try {
				loading = true;
				calendarDays = await getCalendar(eventTypeId, month + 1, year);
			} catch {
				calendarDays = [];
			} finally {
				loading = false;
			}
		}
		loadCalendar();
	});

	$effect(() => {
		async function loadSlots() {
			if (!selectedDate || !eventTypeId) {
				slots = [];
				return;
			}
			try {
				loading = true;
				slots = await getSlots(eventTypeId, selectedDate);
			} catch {
				slots = [];
			} finally {
				loading = false;
			}
		}
		loadSlots();
	});

	function prevMonth() {
		currentDate = new Date(year, month - 1, 1);
	}

	function nextMonth() {
		currentDate = new Date(year, month + 1, 1);
	}

	function getAvailableCount(date: string): number {
		const day = calendarDays.find((d) => d.date === date);
		return day?.availableCount ?? 0;
	}

	function isSelectedDate(date: string): boolean {
		return selectedDate === date;
	}

	function isToday(date: string): boolean {
		return date === formatDate(new Date());
	}
</script>

<div class="grid lg:grid-cols-3 gap-6">
	<!-- Left: Event Info -->
	<Card padding="p-6">
		<div class="flex items-center gap-3 mb-4">
			<div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
				<svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			</div>
			<div>
				<h3 class="font-semibold text-gray-900 dark:text-gray-100">Tota</h3>
				<p class="text-xs text-gray-500 dark:text-gray-400">Host</p>
			</div>
		</div>
		<h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
			Встреча {durationMinutes} минут
		</h2>
		<Badge variant="info" class="mb-4">{durationMinutes} мин</Badge>

		<div class="space-y-3">
			<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-xs text-gray-500 dark:text-gray-400">Выбранная дата</p>
				<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
					{selectedDate ? selectedDate : 'Не выбрана'}
				</p>
			</div>
			<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
				<p class="text-xs text-gray-500 dark:text-gray-400">Выбранное время</p>
				<p class="text-sm font-medium text-gray-900 dark:text-gray-100">
					{selectedSlot ? formatSlotTime(selectedSlot.startTime, selectedSlot.endTime) : 'Не выбрано'}
				</p>
			</div>
		</div>
	</Card>

	<!-- Center: Calendar -->
	<Card padding="p-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Календарь</h3>
			<div class="flex gap-2">
			<button
				onclick={prevMonth}
				class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
			>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				</button>
			<button
				onclick={nextMonth}
				class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
			>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</button>
			</div>
		</div>
		<p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{formatMonthYear(currentDate)}</p>

		<div class="grid grid-cols-7 gap-1 mb-2">
			{#each ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as day}
				<div class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{day}</div>
			{/each}
		</div>

		<div class="grid grid-cols-7 gap-1">
			{#each Array(getFirstDayOfMonth(year, month) === 0 ? 6 : getFirstDayOfMonth(year, month) - 1) as _}
				<div></div>
			{/each}
			{#each Array(daysInMonth) as _, i}
				{@const date = formatDate(new Date(year, month, i + 1))}
			<button
				onclick={() => onDateSelect(date)}
				class="relative p-2 text-sm rounded-lg transition-colors {isSelectedDate(date) ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium' : isToday(date) ? 'border border-primary-500 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}"
			>
					{i + 1}
					{#if getAvailableCount(date) > 0}
						<span class="block text-[10px] text-gray-400 dark:text-gray-500">{getAvailableCount(date)} св.</span>
					{/if}
				</button>
			{/each}
		</div>
	</Card>

	<!-- Right: Slots -->
	<Card padding="p-6">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Статус слотов</h3>

		{#if loading}
			<div class="flex justify-center py-8">
				<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
			</div>
		{:else if slots.length === 0}
			<p class="text-gray-500 dark:text-gray-400 text-center py-8">
				{selectedDate ? 'Нет доступных слотов' : 'Выберите дату'}
			</p>
		{:else}
			<div class="space-y-2 max-h-80 overflow-y-auto">
				{#each slots as slot}
				<button
					onclick={() => slot.status === 'available' && onSlotSelect(slot)}
					class="w-full flex items-center justify-between p-3 rounded-lg border transition-colors {slot.status === 'booked' ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 cursor-not-allowed' : selectedSlot?.startTime === slot.startTime ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer'}"
					disabled={slot.status === 'booked'}
				>
						<span class="text-sm text-gray-700 dark:text-gray-300">{formatSlotTime(slot.startTime, slot.endTime)}</span>
						<Badge variant={slot.status === 'booked' ? 'danger' : 'success'}>
							{slot.status === 'booked' ? 'Занято' : 'Свободно'}
						</Badge>
					</button>
				{/each}
			</div>
		{/if}

		<div class="flex gap-3 mt-6">
			<Button variant="secondary" class="flex-1" href="/book">Назад</Button>
			<Button variant="primary" class="flex-1" disabled={!selectedSlot} onclick={onContinue}>Продолжить</Button>
		</div>
	</Card>
</div>
