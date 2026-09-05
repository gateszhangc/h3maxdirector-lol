/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3003';

function mockUser({ credits, hasActiveSubscription }) {
  return {
    id: `mock-user-${credits}-${hasActiveSubscription}`,
    name: 'Mock Director',
    email: 'director@example.com',
    emailVerified: true,
    image: null,
    credits: { remainingCredits: credits },
    hasActiveSubscription,
  };
}

async function installRoutes(page, options) {
  const user = mockUser(options);

  await page.route('**/get-session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { user } }),
    })
  );

  await page.route('**/api/config/get-configs', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        message: 'ok',
        data: { google_auth_enabled: 'true', google_client_id: 'test-client' },
      }),
    })
  );

  await page.route('**/api/user/get-user-info', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, message: 'ok', data: user }),
    })
  );

  await page.route('**/api/user/get-user-credits', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        options.creditError
          ? { code: -1, message: 'Credit service is temporarily unavailable' }
          : {
              code: 0,
              message: 'ok',
              data: { remainingCredits: options.credits },
            }
      ),
    })
  );
}

async function runScenario(options) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });

  try {
    await installRoutes(page, options);
    await page.goto(`${baseUrl}/`, { waitUntil: 'load', timeout: 45000 });

    const button = page.locator('section#generator button', {
      hasText: 'Start directing',
    });
    await button.waitFor({ state: 'visible', timeout: 15000 });
    await button.click();

    if (options.expectedPath) {
      await page.waitForURL(`**${options.expectedPath}`, { timeout: 15000 });
    } else {
      await page
        .getByText('Credit service is temporarily unavailable')
        .waitFor({
          state: 'visible',
          timeout: 15000,
        });
      if (new URL(page.url()).pathname !== '/') {
        throw new Error(
          `${options.name}: should stay on home after API failure`
        );
      }
    }
  } finally {
    await browser.close();
  }
}

async function run() {
  await runScenario({
    name: 'positive credits without subscription',
    credits: 12,
    hasActiveSubscription: false,
    expectedPath: '/chat',
  });

  await runScenario({
    name: 'zero credits with subscription',
    credits: 0,
    hasActiveSubscription: true,
    expectedPath: '/pricing',
  });

  await runScenario({
    name: 'credit API failure',
    credits: 5,
    hasActiveSubscription: true,
    creditError: true,
  });

  console.log('H3 Max Director credit CTA gate checks passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
