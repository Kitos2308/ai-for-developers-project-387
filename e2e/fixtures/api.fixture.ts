import { test as base, expect } from '@playwright/test';

interface ApiFixtures {
  api: import('@playwright/test').APIRequestContext;
}

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    await use(request);
  },
});

export { expect };