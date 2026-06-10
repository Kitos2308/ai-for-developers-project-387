import { fetchApi } from '$lib/api/client';
import type { EventType, Slot, CalendarDaySlots, Booking, CreateBookingRequest } from '$lib/types';

export async function getEventTypes(): Promise<EventType[]> {
	return fetchApi<EventType[]>('/public/event-types');
}

export async function getEventType(id: string): Promise<EventType> {
	return fetchApi<EventType>(`/public/event-types/${id}`);
}

export async function getSlots(eventTypeId: string, date?: string): Promise<Slot[]> {
	const params = date ? `?date=${date}` : '';
	return fetchApi<Slot[]>(`/public/event-types/${eventTypeId}/slots${params}`);
}

export async function getCalendar(eventTypeId: string, month: number, year: number): Promise<CalendarDaySlots[]> {
	return fetchApi<CalendarDaySlots[]>(`/public/event-types/${eventTypeId}/calendar?month=${month}&year=${year}`);
}

export async function createBooking(eventTypeId: string, body: CreateBookingRequest): Promise<Booking> {
	return fetchApi<Booking>(`/public/event-types/${eventTypeId}/bookings`, {
		method: 'POST',
		body: JSON.stringify(body)
	});
}
