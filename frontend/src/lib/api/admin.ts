import { fetchApi } from '$lib/api/client';
import type { EventType, Booking, CreateEventTypeRequest, UpdateEventTypeRequest, UpdateBookingRequest } from '$lib/types';

export async function getAdminEventTypes(): Promise<EventType[]> {
	return fetchApi<EventType[]>('/admin/event-types');
}

export async function getAdminEventType(id: string): Promise<EventType> {
	return fetchApi<EventType>(`/admin/event-types/${id}`);
}

export async function createEventType(body: CreateEventTypeRequest): Promise<EventType> {
	return fetchApi<EventType>('/admin/event-types', {
		method: 'POST',
		body: JSON.stringify(body)
	});
}

export async function updateEventType(id: string, body: UpdateEventTypeRequest): Promise<EventType> {
	return fetchApi<EventType>(`/admin/event-types/${id}`, {
		method: 'PUT',
		body: JSON.stringify(body)
	});
}

export async function deleteEventType(id: string): Promise<void> {
	return fetchApi<void>(`/admin/event-types/${id}`, {
		method: 'DELETE'
	});
}

export async function getAdminBookings(): Promise<Booking[]> {
	return fetchApi<Booking[]>('/admin/bookings');
}

export async function updateBooking(id: string, body: UpdateBookingRequest): Promise<Booking> {
	return fetchApi<Booking>(`/admin/bookings/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(body)
	});
}

export async function deleteBooking(id: string): Promise<void> {
	return fetchApi<void>(`/admin/bookings/${id}`, {
		method: 'DELETE'
	});
}
