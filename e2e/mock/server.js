const http = require('http');
const crypto = require('crypto');

const PORT = process.env.MOCK_PORT || 8000;

const eventTypes = new Map();
const bookings = new Map();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const MSK_OFFSET = 3;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const BOOKING_WINDOW_DAYS = 14;

function uid() {
  return crypto.randomUUID();
}

function isUUID(s) {
  return UUID_REGEX.test(s);
}

function isDateStr(s) {
  return DATE_REGEX.test(s);
}

function mskNow() {
  const d = new Date();
  return new Date(d.getTime() + MSK_OFFSET * 3600000);
}

function mskTodayStr() {
  return mskNow().toISOString().split('T')[0];
}

function dateStr(d) {
  return d.toISOString().split('T')[0];
}

function parseISO(s) {
  return new Date(s);
}

function bodyParser(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function json(res, status, data) {
  const raw = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(raw),
    ...corsHeaders(),
  });
  res.end(raw);
}

function noContent(res) {
  res.writeHead(204, corsHeaders());
  res.end();
}

function uuid422(res) {
  json(res, 422, { detail: [{ msg: 'Invalid UUID', type: 'value_error' }] });
}

function notFound(res) {
  json(res, 404, { detail: 'Not Found' });
}

function methodNotAllowed(res) {
  json(res, 405, { detail: 'Method Not Allowed' });
}

function respondError(res, status, msg) {
  json(res, status, { detail: msg });
}

function getEventType(id) {
  return eventTypes.get(id) || null;
}

function getBooking(id) {
  return bookings.get(id) || null;
}

function* route(path) {
  const parts = path.replace(/\/+$/, '').split('/');
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '') continue;
    yield parts[i];
  }
}

function matchRoute(path, method) {
  const segs = [];
  for (const s of route(path)) segs.push(s);

  if (method === 'GET' && path === '/health') return { handler: handleHealth };

  if (path.startsWith('/admin/event-types')) {
    if (segs.length === 2 && segs[0] === 'admin' && segs[1] === 'event-types') {
      if (method === 'GET') return { handler: handleAdminETList };
      if (method === 'POST') return { handler: handleAdminETCreate };
    }
    if (segs.length === 3 && segs[0] === 'admin' && segs[1] === 'event-types') {
      const id = segs[2];
      if (method === 'GET') return { handler: handleAdminETGet, id };
      if (method === 'PUT') return { handler: handleAdminETUpdate, id };
      if (method === 'DELETE') return { handler: handleAdminETDelete, id };
    }
  }

  if (path.startsWith('/admin/bookings')) {
    if (segs.length === 2 && segs[0] === 'admin' && segs[1] === 'bookings') {
      if (method === 'GET') return { handler: handleAdminBookingList };
    }
    if (segs.length === 3 && segs[0] === 'admin' && segs[1] === 'bookings') {
      const id = segs[2];
      if (method === 'PATCH') return { handler: handleAdminBookingPatch, id };
      if (method === 'DELETE') return { handler: handleAdminBookingDelete, id };
    }
  }

  if (path.startsWith('/public/event-types')) {
    if (segs.length === 2 && segs[0] === 'public' && segs[1] === 'event-types') {
      if (method === 'GET') return { handler: handlePublicETList };
    }
    if (segs.length === 3 && segs[0] === 'public' && segs[1] === 'event-types') {
      const id = segs[2];
      if (method === 'GET') return { handler: handlePublicETGet, id };
    }
    if (segs.length === 4 && segs[0] === 'public' && segs[1] === 'event-types') {
      const id = segs[2];
      const sub = segs[3];
      if (sub === 'slots' && method === 'GET') return { handler: handleSlots, id };
      if (sub === 'calendar' && method === 'GET') return { handler: handleCalendar, id };
    }
    if (segs.length === 4 && segs[0] === 'public' && segs[1] === 'event-types' && segs[3] === 'bookings') {
      const id = segs[2];
      if (method === 'POST') return { handler: handleCreateBooking, id };
    }
  }

  return null;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  const method = req.method.toUpperCase();
  const query = Object.fromEntries(url.searchParams);

  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  console.log(`${new Date().toISOString()} ${method} ${path}`);

  try {
    const match = matchRoute(path, method);
    if (match) {
      req._query = query;
      await match.handler(req, res, match.id);
    } else {
      methodNotAllowed(res);
    }
  } catch (err) {
    console.error(err);
    respondError(res, 500, 'Internal Server Error');
  }
}

// --- Health ---

function handleHealth(req, res) {
  json(res, 200, { status: 'ok' });
}

// --- Admin: Event Types ---

function handleAdminETList(req, res) {
  const list = [];
  for (const et of eventTypes.values()) list.push(et);
  json(res, 200, list);
}

async function handleAdminETCreate(req, res) {
  const body = await bodyParser(req);
  if (!body.title || body.title.trim() === '') {
    return respondError(res, 422, 'Title is required');
  }
  const dur = body.durationMinutes;
  if (dur === undefined || dur < 1 || dur > 1440) {
    return respondError(res, 422, 'durationMinutes must be between 1 and 1440');
  }
  const et = {
    id: uid(),
    title: body.title,
    description: body.description || null,
    durationMinutes: dur,
  };
  eventTypes.set(et.id, et);
  json(res, 201, et);
}

function handleAdminETGet(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);
  json(res, 200, et);
}

async function handleAdminETUpdate(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);
  const body = await bodyParser(req);
  if (body.title !== undefined) {
    if (body.title.trim() === '') return respondError(res, 422, 'Title cannot be empty');
    et.title = body.title;
  }
  if (body.description !== undefined) et.description = body.description;
  if (body.durationMinutes !== undefined) {
    if (body.durationMinutes < 1 || body.durationMinutes > 1440) {
      return respondError(res, 422, 'durationMinutes must be between 1 and 1440');
    }
    et.durationMinutes = body.durationMinutes;
  }
  eventTypes.set(id, et);
  json(res, 200, et);
}

function handleAdminETDelete(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);
  for (const b of bookings.values()) {
    if (b.eventTypeId === id) {
      return respondError(res, 409, 'Cannot delete EventType with existing bookings');
    }
  }
  eventTypes.delete(id);
  noContent(res);
}

// --- Admin: Bookings ---

function handleAdminBookingList(req, res) {
  const list = [];
  for (const b of bookings.values()) list.push(b);
  json(res, 200, list);
}

async function handleAdminBookingPatch(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const b = getBooking(id);
  if (!b) return notFound(res);
  const body = await bodyParser(req);
  if (body.guestName !== undefined) b.guestName = body.guestName;
  if (body.guestEmail !== undefined) b.guestEmail = body.guestEmail;
  if (body.notes !== undefined) b.notes = body.notes;
  bookings.set(id, b);
  json(res, 200, b);
}

function handleAdminBookingDelete(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  if (!bookings.has(id)) return notFound(res);
  bookings.delete(id);
  noContent(res);
}

// --- Public: Event Types ---

function handlePublicETList(req, res) {
  const list = [];
  for (const et of eventTypes.values()) list.push(et);
  json(res, 200, list);
}

function handlePublicETGet(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);
  json(res, 200, et);
}

// --- Slots ---

function handleSlots(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);

  const queryDate = req._query.date;
  if (!queryDate || !isDateStr(queryDate)) {
    return respondError(res, 422, 'Invalid date format, expected YYYY-MM-DD');
  }

  const todayMSK = mskTodayStr();
  const maxDate = new Date(mskNow());
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);
  const maxDateStr = dateStr(maxDate);

  if (queryDate < todayMSK || queryDate > maxDateStr) {
    return respondError(res, 422, 'Date is outside the booking window');
  }

  const nowMSK = mskNow();
  const durMs = et.durationMinutes * 60000;

  const startUTC = new Date(`${queryDate}T${String(WORK_START_HOUR - MSK_OFFSET).padStart(2, '0')}:00:00Z`);
  const endUTC = new Date(`${queryDate}T${String(WORK_END_HOUR - MSK_OFFSET).padStart(2, '0')}:00:00Z`);

  const slots = [];
  let current = new Date(startUTC);

  while (current.getTime() + durMs <= endUTC.getTime()) {
    const slotEnd = new Date(current.getTime() + durMs);

    const slotStartMSK = new Date(current.getTime() + MSK_OFFSET * 3600000);

    let status;
    if (slotStartMSK <= nowMSK) {
      status = 'unavailable';
    } else {
      const overlapping = Array.from(bookings.values()).some((b) => {
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        return bStart < slotEnd.getTime() && bEnd > current.getTime();
      });
      status = overlapping ? 'booked' : 'available';
    }

    slots.push({
      startTime: current.toISOString(),
      endTime: slotEnd.toISOString(),
      status,
    });

    current = slotEnd;
  }

  json(res, 200, slots);
}

// --- Calendar ---

function handleCalendar(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);

  const month = parseInt(req._query.month, 10);
  const year = parseInt(req._query.year, 10);
  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return respondError(res, 422, 'Invalid month/year');
  }

  const todayMSK = mskNow();
  const todayDateMSK = mskTodayStr();
  const maxDate = new Date(todayMSK);
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);
  const maxDateStr = dateStr(maxDate);

  const daysInMonth = new Date(year, month, 0).getDate();
  const result = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    let availableCount = 0;
    if (ds >= todayDateMSK && ds <= maxDateStr) {
      const startUTC = new Date(`${ds}T${String(WORK_START_HOUR - MSK_OFFSET).padStart(2, '0')}:00:00Z`);
      const endUTC = new Date(`${ds}T${String(WORK_END_HOUR - MSK_OFFSET).padStart(2, '0')}:00:00Z`);
      const durMs = et.durationMinutes * 60000;
      let current = new Date(startUTC);

      while (current.getTime() + durMs <= endUTC.getTime()) {
        const slotEnd = new Date(current.getTime() + durMs);
        const slotStartMSK = new Date(current.getTime() + MSK_OFFSET * 3600000);

        if (slotStartMSK > todayMSK) {
          const overlapping = Array.from(bookings.values()).some((b) => {
            const bStart = new Date(b.startTime).getTime();
            const bEnd = new Date(b.endTime).getTime();
            return bStart < slotEnd.getTime() && bEnd > current.getTime();
          });
          if (!overlapping) availableCount++;
        }
        current = slotEnd;
      }
    }

    result.push({ date: ds, availableCount });
  }

  json(res, 200, result);
}

// --- Create Booking ---

async function handleCreateBooking(req, res, id) {
  if (!isUUID(id)) return uuid422(res);
  const et = getEventType(id);
  if (!et) return notFound(res);

  const body = await bodyParser(req);
  const startTimeStr = body.startTime;
  if (!startTimeStr) {
    return respondError(res, 422, 'startTime is required');
  }

  const startTime = parseISO(startTimeStr);
  if (isNaN(startTime.getTime())) {
    return respondError(res, 422, 'Invalid startTime');
  }

  const startMSK = new Date(startTime.getTime() + MSK_OFFSET * 3600000);
  const nowMSK = mskNow();
  const todayMSK = mskTodayStr();

  const maxDate = new Date(nowMSK);
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);

  if (dateStr(startMSK) < todayMSK || startMSK > maxDate) {
    return respondError(res, 422, 'Start time is outside the booking window');
  }

  const startHourMSK = startMSK.getUTCHours();
  if (startHourMSK < WORK_START_HOUR || startHourMSK >= WORK_END_HOUR) {
    return respondError(res, 422, 'Start time is outside working hours');
  }

  const workStartMSK = new Date(startMSK);
  workStartMSK.setUTCHours(WORK_START_HOUR, 0, 0, 0);
  const minutesFromStart = (startMSK.getTime() - workStartMSK.getTime()) / 60000;
  if (minutesFromStart % et.durationMinutes !== 0) {
    return respondError(res, 422, 'Start time must align with slot boundaries');
  }

  const endTime = new Date(startTime.getTime() + et.durationMinutes * 60000);
  const endMSK = new Date(endTime.getTime() + MSK_OFFSET * 3600000);
  if (endMSK.getUTCHours() > WORK_END_HOUR || (endMSK.getUTCHours() === WORK_END_HOUR && endMSK.getUTCMinutes() > 0)) {
    return respondError(res, 422, 'Slot exceeds working hours');
  }

  const overlapping = Array.from(bookings.values()).some((b) => {
    const bStart = new Date(b.startTime).getTime();
    const bEnd = new Date(b.endTime).getTime();
    return bStart < endTime.getTime() && bEnd > startTime.getTime();
  });
  if (overlapping) {
    return respondError(res, 409, 'Time slot is already booked');
  }

  const booking = {
    id: uid(),
    eventTypeId: id,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    guestName: body.guestName || null,
    guestEmail: body.guestEmail || null,
    notes: body.notes || null,
    createdAt: new Date().toISOString(),
  };

  bookings.set(booking.id, booking);
  json(res, 201, booking);
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
