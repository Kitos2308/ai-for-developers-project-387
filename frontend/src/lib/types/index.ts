export interface EventType {
	id: string;
	title: string;
	description?: string;
	durationMinutes: number;
}

export interface Booking {
	id: string;
	eventTypeId: string;
	startTime: string;
	endTime: string;
	guestName?: string;
	guestEmail?: string;
	notes?: string;
	createdAt: string;
}

export interface Slot {
	startTime: string;
	endTime: string;
	status: 'available' | 'booked';
}

export interface CalendarDaySlots {
	date: string;
	availableCount: number;
}

export interface CreateEventTypeRequest {
	title: string;
	description?: string;
	durationMinutes: number;
}

export interface UpdateEventTypeRequest {
	title?: string;
	description?: string;
	durationMinutes?: number;
}

export interface CreateBookingRequest {
	startTime: string;
	guestName?: string;
	guestEmail?: string;
	notes?: string;
}

export interface UpdateBookingRequest {
	guestName?: string;
	guestEmail?: string;
	notes?: string;
}
