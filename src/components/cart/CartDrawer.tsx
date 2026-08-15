"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ProductArt } from "@/components/product/ProductArt";
import { Separator } from "@/components/ui/separator";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useMoney } from "@/hooks/use-money";
import { useTranslation } from "@/hooks/use-translation";
import {
  cartShipping,
  cartSubtotal,
  useCartStore,
} from "@/store/cart";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const money = useMoney();
  const { t } = useTranslation();

  const subtotal = cartSubtotal(items);
  const shipping = cartShipping(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="border-border bg-obsidian-raised p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-xl tracking-wide text-cream">
            {t.cart.title}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.cart.empty}</p>
            <Link
              href="/catalog"
              onClick={closeCart}
              className="rounded-sm border border-gold px-5 py-2.5 text-xs uppercase tracking-luxe text-gold transition-colors hover:bg-gold hover:text-obsidian"
            >
              {t.cart.emptyCta}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
              <div className="space-y-1.5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gold transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {remaining > 0 ? (
                    <>
                      {t.cart.remainingPrefix}{" "}
                      <span className="text-gold">{money(remaining)}</span> {t.cart.remainingSuffix}
                    </>
                  ) : (
                    <span className="text-gold">{t.cart.freeUnlocked}</span>
                  )}
                </p>
              </div>

              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.sizeLabel}`}
                    className="flex gap-3 border-b border-border pb-4 last:border-none"
                  >
                    <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-obsidian">
                      <ProductArt accent={item.accent} accentSoft={item.accent} variant="bottle" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-display text-base text-cream">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sizeLabel}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-sm border border-border">
                          <button
                            type="button"
                            aria-label={t.cart.decreaseAria}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-gold cursor-pointer"
                            onClick={() =>
                              updateQuantity(item.productId, item.sizeLabel, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-xs text-cream">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={t.cart.increaseAria}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-gold cursor-pointer"
                            onClick={() =>
                              updateQuantity(item.productId, item.sizeLabel, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-display text-sm text-gold">
                          {money(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={t.cart.removeAria}
                      onClick={() => removeItem(item.productId, item.sizeLabel)}
                      className="self-start text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.cart.subtotal}</span>
                <span className="text-cream">{money(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.cart.shipping}</span>
                <span className="text-cream">
                  {shipping === 0 ? t.cart.free : money(shipping)}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between">
                <span className="font-display text-base text-cream">{t.cart.total}</span>
                <span className="font-display text-lg text-gold">
                  {money(subtotal + shipping)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-2 flex w-full items-center justify-center rounded-sm bg-gold py-3 text-xs uppercase tracking-luxe text-obsidian transition-opacity hover:opacity-90"
              >
                {t.cart.checkout}
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="w-full py-2 text-center text-xs uppercase tracking-wide text-muted-foreground hover:text-cream cursor-pointer"
              >
                {t.cart.continueShopping}
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
