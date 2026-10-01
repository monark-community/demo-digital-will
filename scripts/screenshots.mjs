// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start   (serves on port 3145)
//        pnpm screenshots            (BASE_URL defaults to http://localhost:3145)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
// ONLY=<substring> limits the run to matching variants (e.g. ONLY=en-390-light).
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3145"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const L = {
  en: { connect: "Connect demo wallet", confirm: "Confirm", reject: "Reject", dashboard: "Your estate plan", example: "Fill with an example", deploy: "Deploy will", controls: "Demo controls", failNext: "Fail the next transaction", retry: "Try again", accept: "Accept the role", confirmPassing: "Confirm passing", execute: "Execute will", hold: "Hold to prove you're alive", declare: "Simulate a guardian declaration", menu: "Open menu" },
  fr: { connect: "Connecter le portefeuille de démo", confirm: "Confirmer", reject: "Refuser", dashboard: "Votre planification successorale", example: "Remplir avec un exemple", deploy: "Déployer le testament", controls: "Commandes de démo", failNext: "Faire échouer la prochaine transaction", retry: "Réessayer", accept: "Accepter le rôle", confirmPassing: "Confirmer le décès", execute: "Exécuter le testament", hold: "Maintenez pour prouver que vous êtes en vie", declare: "Simuler une déclaration de gardien", menu: "Ouvrir le menu" },
}

async function newPage(browser, v) {
  const context = await browser.newContext({
    viewport: sizes[v.w],
    colorScheme: v.theme,
    locale: v.locale === "fr" ? "fr-CA" : "en-CA",
    hasTouch: v.w < 768,
    isMobile: v.w < 768,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, v.theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  await page.waitForTimeout(300)
  // Fixed toasts would be painted mid-page in a full-page capture; hide them there only.
  if (fullPage) await page.evaluate(() => document.querySelectorAll("[data-sonner-toaster]").forEach((el) => (el.style.visibility = "hidden")))
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage })
  if (fullPage) await page.evaluate(() => document.querySelectorAll("[data-sonner-toaster]").forEach((el) => (el.style.visibility = "")))
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const dialog = (page) => page.getByRole("dialog")
async function approve(page, v) {
  await dialog(page).waitFor()
  await dialog(page).getByRole("button", { name: L[v.locale].confirm, exact: true }).click()
}

async function connect(page, v, capture) {
  const l = L[v.locale]
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = page.getByRole("main").getByRole("button", { name: l.connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "flow1-gate", true)
  await btn.click()
  await dialog(page).waitFor()
  if (capture) await shot(page, v, "flow1-sign-prompt")
  if (capture) {
    await dialog(page).getByRole("button", { name: l.reject }).click()
    await page.getByRole("main").getByRole("alert").waitFor()
    await shot(page, v, "flow1-rejected")
    await btn.click()
  }
  await approve(page, v)
  await page.getByRole("heading", { level: 1, name: l.dashboard }).waitFor({ timeout: 10000 })
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-is-not-in-the-will"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    await shot(page, v, `page-${name}`, true)
  }
  // Calculator with two confirmations
  await page.goto(`${BASE}/${v.locale}/how-it-works`, { waitUntil: "networkidle" })
  const calc = page.locator("#calc")
  await calc.scrollIntoViewIfNeeded()
  await page.getByRole("button", { name: /Nadia/ }).click()
  await page.getByRole("button", { name: /Marc/ }).click()
  await page.getByRole("heading", { name: /Play with the window/ }).scrollIntoViewIfNeeded()
  await shot(page, v, "page-how-calculator")
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: L[v.locale].menu }).click()
    await dialog(page).waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  const l = L[v.locale]
  // Flow 1: sign in (gate, prompt, rejected, dashboard)
  await connect(page, v, true)
  await page.waitForTimeout(600)
  await shot(page, v, "flow1-dashboard", true)

  // Flow 4: proof of life on "Family savings"
  await page.goto(`${BASE}/${v.locale}/app/will/family-savings`, { waitUntil: "networkidle" })
  const hold = page.getByRole("button", { name: l.hold })
  await hold.waitFor()
  await shot(page, v, "flow4-declared", true)
  await hold.scrollIntoViewIfNeeded()
  const box = await hold.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(800)
  await shot(page, v, "flow4-holding")
  await page.waitForTimeout(1000)
  await page.mouse.up()
  await dialog(page).waitFor()
  await shot(page, v, "flow4-veto-prompt")
  await approve(page, v)
  await page.locator("[data-status=pending]").first().waitFor()
  await shot(page, v, "flow4-veto-pending")
  await page.getByText(/Declarations paused until|Déclarations suspendues/).first().waitFor({ timeout: 10000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow4-vetoed", true)
  // Cooldown refusal in the demo controls
  await page.getByRole("button", { name: l.controls }).click()
  await dialog(page).getByRole("button", { name: l.declare }).click()
  await dialog(page).getByRole("status").waitFor()
  await shot(page, v, "flow4-cooldown-controls")
  await page.keyboard.press("Escape")

  // Flow 2: write and deploy a will (errors, filled, failed, pending, deployed, guardians accept)
  await page.goto(`${BASE}/${v.locale}/app/new`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: l.deploy }).first().click()
  await page.waitForTimeout(200)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow2-errors", true)
  await page.getByRole("button", { name: l.example }).click()
  await shot(page, v, "flow2-filled", true)
  await page.getByRole("button", { name: l.controls }).click()
  await dialog(page).getByLabel(l.failNext).click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: l.deploy }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow2-deploy-prompt")
  await approve(page, v)
  await page.locator("[data-status=pending]").first().waitFor()
  await page.locator("[data-status=pending]").first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-deploy-pending")
  await page.getByRole("button", { name: l.retry }).waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: l.retry }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-deploy-failed")
  await page.getByRole("button", { name: l.retry }).click()
  await approve(page, v)
  await page.waitForURL(/\/app\/will\//, { timeout: 15000 })
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow2-deployed-inactive", true)
  await page.waitForTimeout(8000)
  await shot(page, v, "flow2-guardians-accepted")

  // Flow 3: guard: accept Robert's invitation, then confirm Hélène's passing
  await page.goto(`${BASE}/${v.locale}/app/will/robert-gagnon`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: l.accept }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow3-accept-prompt")
  await approve(page, v)
  await page.getByRole("button", { name: l.confirmPassing }).waitFor({ timeout: 10000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow3-accepted", true)
  await page.goto(`${BASE}/${v.locale}/app/will/helene-cote`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: l.confirmPassing }).waitFor()
  await shot(page, v, "flow3-helene-before", true)
  await page.getByRole("button", { name: l.confirmPassing }).click()
  await approve(page, v)
  await page.getByRole("button", { name: l.execute }).waitFor({ timeout: 10000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow3-executable", true)

  // Flow 5: execute and read the estate record
  await page.getByRole("button", { name: l.execute }).click()
  await dialog(page).waitFor()
  await shot(page, v, "flow5-execute-prompt")
  await approve(page, v)
  await page.locator("ol li").filter({ hasText: /tUSDC/ }).first().waitFor({ timeout: 10000 })
  await page.waitForTimeout(1300)
  await shot(page, v, "flow5-executing")
  await page.locator("#record-title").waitFor({ timeout: 15000 })
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow5-estate-record", true)

  // Demo controls
  await page.getByRole("button", { name: l.controls }).click()
  await dialog(page).waitFor()
  await shot(page, v, "app-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  const l = L[v.locale]
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await shot(page, v, "page-home", true)
  await connect(page, v, false)
  await page.waitForTimeout(600)
  await shot(page, v, "flow1-dashboard", true)
  await page.goto(`${BASE}/fr/app/will/helene-cote`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: l.confirmPassing }).click()
  await approve(page, v)
  await page.getByRole("button", { name: l.execute }).waitFor({ timeout: 10000 })
  await page.getByRole("button", { name: l.execute }).click()
  await approve(page, v)
  await page.locator("#record-title").waitFor({ timeout: 20000 })
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow5-estate-record", true)
  await page.goto(`${BASE}/fr/app/will/family-savings`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: l.hold }).waitFor()
  await shot(page, v, "flow4-declared", true)
  await page.goto(`${BASE}/fr/app/new`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: l.example }).click()
  await shot(page, v, "flow2-filled", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
