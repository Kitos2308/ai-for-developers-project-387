#!/bin/sh
set -e

make migrate.up

cd backend

echo "Starting uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
