"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCartStore } from "@/store/fly-to-cart";

export function FlyToCartLayer() {
  const requests = useFlyToCartStore((state) => state.requests);
  const remove = useFlyToCartStore((state) => state.remove);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {requests.map((request) => {
          const target = document.getElementById("header-cart-icon")?.getBoundingClientRect();
          const targetX = target ? target.left + target.width / 2 : request.originX;
          const targetY = target ? target.top + target.height / 2 : request.originY;

          return (
            <motion.div
              key={request.id}
              initial={{ x: request.originX, y: request.originY, scale: 1, opacity: 1 }}
              animate={{ x: targetX, y: targetY, scale: 0.25, opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => remove(request.id)}
              className="absolute top-0 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: request.accent, boxShadow: `0 0 18px ${request.accent}` }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
