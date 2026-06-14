FROM python:3.12-slim AS builder

ENV POETRY_VERSION=2.1.2 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_HOME=/opt/poetry

RUN pip install "poetry==$POETRY_VERSION"

WORKDIR /app
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root --only main

FROM python:3.12-slim AS runner

RUN apt-get update && apt-get install -y make && rm -rf /var/lib/apt/lists/*

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

COPY --from=builder /app/.venv /app/.venv

WORKDIR /project
COPY Makefile .
COPY . ./backend

COPY entrypoint.sh ./backend/entrypoint.sh
RUN chmod +x backend/entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["./backend/entrypoint.sh"]
