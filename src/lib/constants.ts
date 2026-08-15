export const FREE_SHIPPING_THRESHOLD = 150;
export const STANDARD_SHIPPING_COST = 9.9;
export const VAT_RATE = 0.22;

/**
 * Canonical (never translated) shipping-country values, shared by the
 * checkout form's <select> and every place an order's country is later
 * displayed (order success, admin, tracking). Only the visible label is
 * translated (via the dictionary's `checkout.countries`, same index) — the
 * stored value stays stable across a locale switch.
 */
export const COUNTRY_VALUES = ["Italia", "San Marino", "Svizzera", "Città del Vaticano"];
