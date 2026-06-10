#!/bin/sh
set -e

echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!! VITE_API_URL = ${VITE_API_URL:-<not set>}"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"

# Replace the hardcoded fallback API URL in built JS files with the runtime VITE_API_URL value.
# At build time (no .env), import.meta.env.VITE_API_URL resolves to undefined,
# so the fallback URL is baked into the output.
# At container start we swap it for the real URL from the environment.
FALLBACK_URL='https://ai-for-developers-project-386-y0w1.onrender.com'
API_URL="${VITE_API_URL:-}"
if [ -n "$API_URL" ] && [ "$API_URL" != "$FALLBACK_URL" ]; then
    echo "Injecting API_URL: $API_URL"
    find /project/frontend/build -name '*.js' -exec sed -i "s|${FALLBACK_URL}|${API_URL}|g" {} +
fi

echo "Starting frontend..."
exec make start
