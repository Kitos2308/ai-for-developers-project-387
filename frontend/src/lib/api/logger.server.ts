import { env } from '$env/dynamic/private';

export const LOG_API_REQUESTS = env.LOG_API_REQUESTS === 'true';
