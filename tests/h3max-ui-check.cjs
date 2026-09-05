/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3003';
const projectRoot = path.resolve(__dirname, '..');
const pricing = JSON.parse(
  fs.readFileSync(
    path.join(projectRoot, 'src/config/locale/messages/en/pages/pricing.json'),
    'utf8'
  )
).page.sections.pricing;

async function installPublicRoutes(page) {
  await page.route('**/get-session', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
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
}

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const consoleErrors = [];
  const failedAssets = [];

  page.on('console', (message) => {
    const text = message.text();
    const insecurePreviewCoopWarning =
      text.includes('Cross-Origin-Opener-Policy header has been ignored') &&
      baseUrl.startsWith('http://');
    if (message.type() === 'error' && !insecurePreviewCoopWarning) {
      consoleErrors.push(text);
    }
  });
  page.on('requestfailed', (request) => {
    if (
      request.resourceType() === 'media' &&
      request.failure()?.errorText === 'net::ERR_ABORTED'
    ) {
      return;
    }
    if (new URL(request.url()).origin === new URL(baseUrl).origin) {
      failedAssets.push(`${request.url()}: ${request.failure()?.errorText}`);
    }
  });

  await installPublicRoutes(page);
  await page.goto(`${baseUrl}/`, { waitUntil: 'load', timeout: 45000 });

  if (!(await page.title()).includes('H3 Max Director')) {
    throw new Error(`Unexpected home title: ${await page.title()}`);
  }

  const bodyText = await page.locator('body').innerText();
  for (const expected of [
    'Direct the story while it unfolds',
    'continuous realtime video stream',
    'characters, settings, and story continuity',
  ]) {
    if (!bodyText.includes(expected))
      throw new Error(`Home copy missing: ${expected}`);
  }

  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href');
  if (canonical !== 'https://h3maxdirector.lol/') {
    throw new Error(`Unexpected canonical URL: ${canonical}`);
  }

  for (const asset of [
    '/logo.svg',
    '/logo.png',
    '/favicon.png',
    '/h3max/seedance-shaqiu.mp4',
  ]) {
    const response = await page.request.get(new URL(asset, baseUrl).toString());
    if (!response.ok())
      throw new Error(`Asset failed: ${asset} (${response.status()})`);
  }

  const generator = page.locator('section#generator');
  const generatorText = await generator.innerText();
  for (const expected of [
    'Opening direction',
    'First frame',
    '480p',
    '768p',
    'Sign in to start',
  ]) {
    if (!generatorText.includes(expected))
      throw new Error(`Generator missing: ${expected}`);
  }

  await generator.getByRole('button', { name: 'Sign in to start' }).click();
  const signModal = page.locator('[role="dialog"]');
  await signModal.waitFor({ state: 'visible', timeout: 15000 });
  const signText = await signModal.innerText();
  if (!signText.includes('Sign in with Google'))
    throw new Error('Google sign-in missing');
  if (
    (await signModal
      .locator('input[type="email"], input[type="password"]')
      .count()) > 0
  ) {
    throw new Error('Email/password sign-in should not be visible');
  }
  if (signText.includes('Sign in with GitHub'))
    throw new Error('GitHub sign-in should not be visible');
  await page.keyboard.press('Escape');

  await page.screenshot({
    path: path.join(projectRoot, 'tests/h3maxdirector-home.png'),
    fullPage: true,
  });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await installPublicRoutes(mobile);
  await mobile.goto(`${baseUrl}/`, { waitUntil: 'load', timeout: 45000 });
  const overflow = await mobile.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );
  if (overflow) throw new Error('Mobile home page has horizontal overflow');
  await mobile.close();

  await page.goto(`${baseUrl}/pricing`, { waitUntil: 'load', timeout: 45000 });
  if (!(await page.title()).includes('H3 Max Director')) {
    throw new Error(`Unexpected pricing title: ${await page.title()}`);
  }
  if (
    !(await page.locator('body').innerText()).includes(
      'H3 Max Director Pricing'
    )
  ) {
    throw new Error('Pricing heading missing');
  }

  for (const group of pricing.groups) {
    await page.getByRole('tab', { name: group.title }).click();
    const expectedCards = pricing.items.filter(
      (item) => item.group === group.name
    );
    if (expectedCards.length !== 3)
      throw new Error(`Unexpected ${group.name} plan count`);
    for (const item of expectedCards) {
      await page.getByRole('button', { name: item.button.title }).waitFor();
    }
  }

  await page.screenshot({
    path: path.join(projectRoot, 'tests/h3maxdirector-pricing.png'),
    fullPage: true,
  });

  if (failedAssets.length)
    throw new Error(`Failed same-origin requests:\n${failedAssets.join('\n')}`);
  if (consoleErrors.length)
    throw new Error(`Console errors:\n${consoleErrors.join('\n')}`);

  await browser.close();
  console.log('H3 Max Director UI checks passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
