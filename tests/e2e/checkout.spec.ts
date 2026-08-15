import { test, expect } from "@playwright/test";

/**
 * Full purchase journey: Add to cart -> Scent Finder -> Checkout -> Order
 * Tracking. Runs against a production build (see playwright.config.ts) with
 * no Stripe/Supabase keys set, exactly like this portfolio's default
 * deployment — so it exercises the same Fallback Mode paths described
 * throughout the codebase (in-memory orders/inventory, demo checkout).
 */
test.describe("Lynux Profumi — checkout journey", () => {
  test("add to cart, take the scent quiz, check out, then track the order", async ({ page }) => {
    // --- 1. Add to cart from the homepage bestsellers grid -----------------
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Unseen/i })).toBeVisible();

    await page.getByRole("button", { name: "Aggiungi" }).first().click();
    await expect(page.getByText("Il tuo Carrello")).toBeVisible();

    const cartBadge = page.locator("#header-cart-icon span", { hasText: "1" });
    await expect(cartBadge).toBeVisible();

    // --- 2. Scent Finder quiz (navigating away closes the drawer too) ------
    await page.goto("/scent-finder");
    await page.getByRole("button", { name: "Estate", exact: true }).click();
    await page.getByRole("button", { name: "Energica e Luminosa", exact: true }).click();
    await page.getByRole("button", { name: "Agrumi & Note Verdi", exact: true }).click();

    await expect(page.getByText("Il tuo Risultato")).toBeVisible();
    await expect(page.getByRole("link", { name: /Scopri/ })).toBeVisible();

    // --- 3. Checkout -----------------------------------------------------
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Completa il tuo Ordine" })).toBeVisible();

    await page.getByLabel("Email").fill("cliente.test@example.com");
    await page.getByLabel("Nome", { exact: true }).fill("Giulia");
    await page.getByLabel("Cognome").fill("Ferrari");
    await page.getByLabel("Indirizzo").fill("Via Montenapoleone 8");
    await page.getByLabel("Città").fill("Milano");
    await page.getByLabel("CAP").fill("20121");
    await page.getByLabel("Provincia").fill("MI");
    await page.getByLabel("Telefono").fill("+39 333 1234567");

    // Card is the default payment method; without Stripe keys this stays
    // fully simulated (no real card fields to fill in).
    await expect(page.getByText("Simulazione di pagamento")).toBeVisible();

    // The 10-minute inventory hold countdown should be visible before we
    // submit — this is the Inventory Reservation Engine in action.
    await expect(page.getByText(/Riservato per te: \d{2}:\d{2}/)).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Conferma Ordine Demo" }).click();

    await expect(page).toHaveURL(/\/checkout\/success/);
    await expect(page.getByRole("heading", { name: /Grazie, Giulia/ })).toBeVisible();

    const orderNumber = await page.getByText(/^LYNUX-/).first().textContent();
    expect(orderNumber).toBeTruthy();

    // --- 4. Order tracking, from a clean tab (no client-side cart/order
    // state) — proves the order really round-tripped through the backend,
    // not just local Zustand state. --------------------------------------
    const trackingPage = await page.context().newPage();
    await trackingPage.goto("/track-order");
    await trackingPage.getByLabel("Codice Ordine").fill(orderNumber!.trim());
    await trackingPage.getByRole("button", { name: "Traccia Ordine" }).click();

    await expect(trackingPage.getByText("Aggiornamento in tempo reale")).toBeVisible();
    await expect(trackingPage.getByText("Riepilogo Ordine")).toBeVisible({ timeout: 15_000 });
    await expect(trackingPage.getByText("Ordine Ricevuto")).toBeVisible();

    await trackingPage.close();
  });
});
