import { test, expect, Page } from '@playwright/test';

const CASES = ['multi-agent-ops', 'restrictions-rag', 'construction-forecast', 'midr', 'nutrir', 'crif'];
const PAGES = ['/', ...CASES.map((s) => `/projects/${s}.html`)];
const BANNED = [/seegold/i, /\bfounder\b/i, /our team/i, /my company/i, /paying gyms/i];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

for (const path of PAGES) {
  test(`${path} loads clean, is noindex, fits the viewport`, async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // clipping containers hide overflow from scrollWidth, so check layout boxes directly
    const tooWide = await page.evaluate(() => {
      const limit = window.innerWidth - 8;
      return Array.from(document.querySelectorAll('main .container *'))
        .filter((el) => !el.closest('.marquee, .scene, .sh-stage, [data-topo]'))
        .filter((el) => el.getBoundingClientRect().right > limit)
        .map((el) => `${el.tagName}.${el.className}`).slice(0, 5);
    });
    expect(tooWide).toEqual([]);
    const text = await page.locator('body').innerText();
    for (const re of BANNED) expect(text).not.toMatch(re);
    await expect(page.locator('a[data-resume]').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('home lists six cases whose detail links and résumé resolve', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.work-case')).toHaveCount(6);
  const hrefs = await page.locator('.work-case a.more').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs).toEqual(CASES.map((s) => `projects/${s}.html`));
  for (const h of hrefs) expect((await request.get(`/${h}`)).status()).toBe(200);
  const pdf = await request.get('/Klayver_Paz_Resume.pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('pdf');
});

test('showcase cycles through clones of all six case scenes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#sh-stage > .scene')).toHaveCount(6);
  await expect(page.locator('#sh-stage .scene[id], #sh-stage .scene [id]')).toHaveCount(0);
  await expect(page.locator('#sh-stage > .scene.is-active')).toHaveCount(1);
  await expect(page.locator('[data-sh-go]')).toHaveAttribute('href', 'projects/multi-agent-ops.html');
  await page.locator('.sh-bars button').nth(3).click();
  await expect(page.locator('[data-sh-title]')).toHaveText('Road inspection from video');
  await expect(page.locator('[data-sh-go]')).toHaveAttribute('href', 'projects/midr.html');
});

test('scenes animate when scrolled into view', async ({ page }) => {
  await page.goto('/');
  const scene = page.locator('#case-restrictions-rag .scene');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveClass(/\bs2\b/, { timeout: 4000 });
  await expect(scene.locator('.rg-list li.done').first()).toBeVisible({ timeout: 6000 });
});

test('reduced motion shows final states, not zeros', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const nums = await page.locator('.stats [data-to]').allInnerTexts();
  expect(nums).toEqual(['40', '100', '6']);
  await expect(page.locator('#case-nutrir .scene')).toHaveClass(/\bs6\b/);
  await expect(page.locator('#case-nutrir .ml-weight [data-to]')).toHaveText('528');
  await expect(page.locator('#case-construction-forecast .ob-list em').first()).toHaveText('Risk · +6 days');
});

test('detail page deep link works on its own', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/projects/nutrir.html', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveText('Checking public meals from a photo');
  await expect(page.locator('.flow li')).toHaveCount(4);
  await expect(page.locator('.gallery img')).toHaveCount(2);
  await expect(page.locator('.pager a')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test('hero layout: showcase beside the copy on desktop, inside the gutter on mobile', async ({ page }, info) => {
  await page.goto('/');
  const copy = await page.locator('.hero-copy').boundingBox();
  const show = await page.locator('#showcase').boundingBox();
  const vw = page.viewportSize()!.width;
  if (info.project.name === 'desktop') {
    expect(show!.x).toBeGreaterThan(copy!.x + copy!.width - 1);
    expect(show!.y).toBeLessThan(copy!.y + copy!.height);
  } else {
    expect(show!.x + show!.width).toBeLessThanOrEqual(vw - 16 + 1);
    for (const box of await page.locator('#sh-stage > .scene').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().right))) {
      expect(box).toBeLessThanOrEqual(vw - 16);
    }
  }
});
