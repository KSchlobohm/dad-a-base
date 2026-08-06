import { expect, test } from '@playwright/test'

const JOKES = [
  { setup: 'What do you call a factory that makes okay products?', punchline: 'A satisfactory.' },
  { setup: "Why don't skeletons fight?", punchline: "They don't have the guts." },
  { setup: 'I used to hate facial hair...', punchline: 'but then it grew on me.' },
  { setup: "I'm reading a book about anti-gravity...", punchline: "It's impossible to put down." },
  { setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field.' },
  { setup: 'I used to be a banker...', punchline: 'but I lost interest.' },
  { setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go." },
  { setup: "What do you call cheese that isn't yours?", punchline: 'Nacho cheese.' },
  { setup: 'Why did the bicycle fall over?', punchline: 'Because it was two-tired.' },
  { setup: 'How do you organize a space party?', punchline: 'You planet.' },
  { setup: 'What do you call a sleeping dinosaur?', punchline: 'A dino-snore.' },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up." },
  { setup: 'What do you call a fake noodle?', punchline: 'An impasta.' },
  { setup: 'Why did the math book look so sad?', punchline: 'Because it had too many problems.' },
  { setup: 'What do you call a bear with no teeth?', punchline: 'A gummy bear.' },
  { setup: "Why can't a nose be 12 inches long?", punchline: 'Because then it would be a foot.' },
  { setup: 'What did the ocean say to the beach?', punchline: 'Nothing, it just waved.' },
  { setup: 'Why did the golfer bring an extra pair of pants?', punchline: 'In case he got a hole in one.' },
  { setup: 'Did you hear about the claustrophobic astronaut?', punchline: 'He just needed a little space.' },
  { setup: 'Why do bees have sticky hair?', punchline: 'Because they use a honeycomb.' },
] as const

test.describe('Dad-A-Base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
  })

  test('shows the page title', async ({ page }) => {
    await expect(page).toHaveTitle('Dad-A-Base')
    await expect(page.locator('h1')).toHaveText('Dad-A-Base')
  })

  test('displays the first joke setup on load', async ({ page }) => {
    await expect(page.locator('#setup-text')).toHaveText(JOKES[0].setup)
    await expect(page.locator('#punchline-text')).toBeHidden()
  })

  test('tapping the card reveals the punchline while keeping the setup visible', async ({ page }) => {
    await page.locator('#card').click()
    await expect(page.locator('#setup-text')).toHaveText(JOKES[0].setup)
    await expect(page.locator('#punchline-text')).toBeVisible()
    await expect(page.locator('#punchline-text')).toHaveText(JOKES[0].punchline)
  })

  test('tapping the card a second time hides the punchline and stays on the same joke', async ({ page }) => {
    await page.locator('#card').click()
    await page.locator('#card').click()
    await expect(page.locator('#punchline-text')).toBeHidden()
    await expect(page.locator('#setup-text')).toHaveText(JOKES[0].setup)
  })

  test('Next button advances to the next joke', async ({ page }) => {
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.locator('#setup-text')).toHaveText(JOKES[1].setup)
  })

  test('Back button goes to the previous joke and wraps around', async ({ page }) => {
    await page.getByRole('button', { name: /back/i }).click()
    await expect(page.locator('#setup-text')).toHaveText(JOKES.at(-1)?.setup ?? '')
  })

  test('navigating while punchline is visible resets to hidden on new joke', async ({ page }) => {
    await page.locator('#card').click()
    await page.getByRole('button', { name: /next/i }).click()
    await expect(page.locator('#setup-text')).toHaveText(JOKES[1].setup)
    await expect(page.locator('#punchline-text')).toBeHidden()
  })

  test('keyboard arrows navigate in both directions', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#setup-text')).toHaveText(JOKES[1].setup)
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator('#setup-text')).toHaveText(JOKES[0].setup)
  })

  test('navigation wraps forward from last joke to first', async ({ page }) => {
    for (let index = 0; index < JOKES.length; index += 1) {
      await page.getByRole('button', { name: /next/i }).click()
    }
    await expect(page.locator('#setup-text')).toHaveText(JOKES[0].setup)
  })

  test('Back and Next buttons are visible below the card', async ({ page }) => {
    const cardBox = await page.locator('#card').boundingBox()
    const backBox = await page.getByRole('button', { name: /back/i }).boundingBox()
    const nextBox = await page.getByRole('button', { name: /next/i }).boundingBox()
    if (!cardBox || !backBox || !nextBox) {
      throw new Error('Expected card and navigation bounds')
    }
    expect(backBox.y).toBeGreaterThan(cardBox.y + cardBox.height)
    expect(nextBox.y).toBeGreaterThan(cardBox.y + cardBox.height)
  })

  test('preserves the complete joke catalog, order, hints, and optional link', async ({ page }) => {
    for (const [index, joke] of JOKES.entries()) {
      await expect(page.locator('#setup-text')).toHaveText(joke.setup)
      await expect(page.locator('#punchline-text')).toBeHidden()
      await expect(page.locator('.hint')).toHaveText('tap to reveal')
      await page.locator('#card').click()
      await expect(page.locator('#punchline-text')).toHaveText(joke.punchline)
      await expect(page.locator('.hint')).toHaveText('tap to hide • use Next/Back to navigate')

      const link = page.locator('#joke-link-container a')
      if (index === 0) {
        await expect(link).toHaveAttribute('href', 'https://store.steampowered.com/app/526870/Satisfactory/')
        await expect(link).toHaveAttribute('target', '_blank')
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      } else {
        await expect(link).toHaveCount(0)
      }
      await page.getByRole('button', { name: /next/i }).click()
    }
  })

  test('clicking the optional link does not hide the punchline', async ({ page }) => {
    await page.locator('#card').click()
    await page.locator('#joke-link-container a').evaluate((link) => {
      link.addEventListener('click', (event) => event.preventDefault(), { once: true })
    })
    await page.locator('#joke-link-container a').click()
    await expect(page.locator('#punchline-text')).toBeVisible()
  })

  test('keyboard activation of the optional link is not intercepted by the card', async ({ page }) => {
    await page.locator('#card').click()
    const link = page.locator('#joke-link-container a')
    await link.evaluate((element) => {
      element.addEventListener('click', (event) => event.preventDefault(), { once: true })
    })
    await link.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#punchline-text')).toBeVisible()
  })

  test('fits the card and navigation within a narrow mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    const cardBox = await page.locator('#card').boundingBox()
    const navBox = await page.locator('.nav').boundingBox()
    if (!cardBox || !navBox) {
      throw new Error('Expected mobile layout bounds')
    }
    expect(cardBox.x).toBeGreaterThanOrEqual(0)
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(375)
    expect(navBox.x).toBeGreaterThanOrEqual(0)
    expect(navBox.x + navBox.width).toBeLessThanOrEqual(375)
  })

  test('loads production assets and manifest beneath the project path', async ({ page, request }) => {
    expect(new URL(page.url()).pathname).toBe('/dad-a-base/')
    const manifestLink = page.locator('link[rel="manifest"]')
    const manifestHref = await manifestLink.getAttribute('href')
    expect(manifestHref).toBeTruthy()

    const manifestResponse = await request.get(
      new URL(manifestHref ?? '', page.url()).toString(),
    )
    expect(manifestResponse.ok()).toBe(true)
    const manifest = await manifestResponse.json() as {
      start_url: string
      scope: string
      icons: Array<{ src: string }>
    }
    expect(manifest.start_url).toBe('/dad-a-base/')
    expect(manifest.scope).toBe('/dad-a-base/')
    for (const icon of manifest.icons) {
      expect((await request.get(new URL(icon.src, page.url()).toString())).ok()).toBe(true)
    }
  })

  test('loads the cached app shell offline after service worker activation', async ({ page, context }) => {
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
    })
    await page.reload()
    await context.setOffline(true)
    try {
      await page.reload()
      await expect(page.locator('#setup-text')).toHaveText(JOKES[0].setup)
    } finally {
      await context.setOffline(false)
    }
  })

  test('does not emit browser errors during the main journey', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))
    await page.locator('#card').click()
    await page.getByRole('button', { name: /next/i }).click()
    await page.keyboard.press('ArrowLeft')
    await page.locator('#card').click()
    expect(errors).toEqual([])
  })

  test('captures local evidence screenshots when requested', async ({ page }) => {
    const evidenceDirectory = process.env.EVIDENCE_DIR
    test.skip(!evidenceDirectory, 'Only needed while assembling a local evidence package')
    if (!evidenceDirectory) return

    await page.screenshot({
      path: `${evidenceDirectory}/final-desktop.png`,
      fullPage: true,
    })
    await page.setViewportSize({ width: 375, height: 667 })
    await page.screenshot({
      path: `${evidenceDirectory}/final-mobile.png`,
      fullPage: true,
    })
  })
})
