import uuid

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from dependencies import get_db, get_event_type_use_case
from schemas.event_type import EventTypeCreateRequest, EventTypeResponse, EventTypeUpdateRequest
from use_cases.event_type import EventTypeUseCase

router = APIRouter()


@router.get("", response_model=list[EventTypeResponse])
def list_event_types(
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    result = use_case.list_all()
    db.commit()
    return result


@router.get("/{id}", response_model=EventTypeResponse)
def get_event_type(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    result = use_case.get_by_id(id)
    db.commit()
    return result


@router.post("", response_model=EventTypeResponse, status_code=201)
def create_event_type(
    body: EventTypeCreateRequest,
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    result = use_case.create(
        title=body.title,
        description=body.description,
        duration_minutes=body.duration_minutes,
    )
    db.commit()
    return result


@router.put("/{id}", response_model=EventTypeResponse)
def update_event_type(
    id: uuid.UUID,
    body: EventTypeUpdateRequest,
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    result = use_case.update(
        event_type_id=id,
        title=body.title,
        description=body.description,
        duration_minutes=body.duration_minutes,
    )
    db.commit()
    return result


@router.delete("/{id}", status_code=204)
def delete_event_type(
    id: uuid.UUID,
    db: Session = Depends(get_db),
):
    use_case = get_event_type_use_case(db)
    use_case.delete(id)
    db.commit()
    return Response(status_code=204)