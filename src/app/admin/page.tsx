import type { Metadata } from "next";
import { isAdminGateConfigured } from "@/lib/env";
import { AdminGate } from "@/components/admin/AdminGate";

export const metadata: Metadata = {
  title: "Admin Dashboard | Lynux Profumi",
  description: "Pannello riservato: fatturato, ordini e inventario Lynux Profumi.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminGate gateConfigured={isAdminGateConfigured} />;
}
