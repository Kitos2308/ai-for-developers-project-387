from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import admin_bookings, admin_event_types, public_bookings, public_event_types
from settings import settings


app = FastAPI(title="Mini Cal API", version="0.1.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_event_types.router, prefix="/public/event-types", tags=["public-event-types"])
app.include_router(public_bookings.router, prefix="/public/event-types/{eventTypeId}/bookings", tags=["public-bookings"])
app.include_router(admin_event_types.router, prefix="/admin/event-types", tags=["admin-event-types"])
app.include_router(admin_bookings.router, prefix="/admin/bookings", tags=["admin-bookings"])


@app.get("/health")
def health():
    return {"status": "ok"}