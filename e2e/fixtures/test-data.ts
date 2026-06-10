export const VALID_EVENT_TYPE = {
  title: 'Встреча 30 минут',
  description: 'Короткая встреча для обсуждения',
  durationMinutes: 30,
};

export const VALID_EVENT_TYPE_60 = {
  title: 'Консультация 60 минут',
  description: 'Полная консультация',
  durationMinutes: 60,
};

export const VALID_EVENT_TYPE_15 = {
  title: 'Быстрый звонок',
  description: '15 минут',
  durationMinutes: 15,
};

export function futureDate(daysFromNow: number = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export function futureSlotTime(daysFromNow: number = 1, hour: number = 10): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function futureSlotTimeUTC(daysFromNow: number = 1, hourUTC: number = 10): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(hourUTC, 0, 0, 0);
  return d.toISOString();
}

export const INVALID_UUID = '00000000-0000-0000-0000-000000000000';
export const MALFORMED_UUID = 'not-a-uuid';