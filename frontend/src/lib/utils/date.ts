const MONTHS_RU = [
	'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
	'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
];

const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAYS_FULL_RU = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

export function formatDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function formatMonthYear(date: Date): string {
	return `${MONTHS_RU[date.getMonth()]} ${date.getFullYear()} г.`;
}

export function formatDayOfWeek(date: Date): string {
	return DAYS_FULL_RU[date.getDay()];
}

export function formatDayMonth(date: Date): string {
	const day = date.getDate();
	const month = MONTHS_RU[date.getMonth()].slice(0, -1);
	return `${formatDayOfWeek(date)}, ${day} ${month}`;
}

const MSK_TZ = 'Europe/Moscow';

export function formatTime(date: Date): string {
	return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: MSK_TZ });
}

export function formatSlotTime(startTime: string, endTime: string): string {
	const start = new Date(startTime);
	const end = new Date(endTime);
	return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatDateTimeMSK(isoString: string, options?: Intl.DateTimeFormatOptions): string {
	const defaultOptions: Intl.DateTimeFormatOptions = {
		dateStyle: 'full',
		timeStyle: 'short',
		timeZone: MSK_TZ,
	};
	return new Date(isoString).toLocaleString('ru-RU', { ...defaultOptions, ...options });
}

export function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 1).getDay();
}

export function generateTimeSlots(durationMinutes: number, bookedSlots: { startTime: string; endTime: string }[]): { startTime: string; endTime: string; status: 'available' | 'booked' }[] {
	const slots: { startTime: string; endTime: string; status: 'available' | 'booked' }[] = [];
	const startHour = 9;
	const endHour = 18;

	for (let hour = startHour; hour < endHour; hour++) {
		for (let min = 0; min < 60; min += durationMinutes) {
			const slotStart = new Date();
			slotStart.setHours(hour, min, 0, 0);
			const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

			if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
				continue;
			}

			const isBooked = bookedSlots.some(
				(booked) =>
					new Date(booked.startTime).getTime() === slotStart.getTime()
			);

			slots.push({
				startTime: slotStart.toISOString(),
				endTime: slotEnd.toISOString(),
				status: isBooked ? 'booked' : 'available'
			});
		}
	}

	return slots;
}
