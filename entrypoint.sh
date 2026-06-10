#!/bin/sh
set -e

echo "Running migrations..."
cd /project/backend
alembic upgrade head

echo "Starting backend on port 8000..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

echo "Starting frontend on port ${PORT:-3000}..."
cd /project/frontend
exec node build