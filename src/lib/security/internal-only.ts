import { notFound } from "next/navigation";

import { jsonNoStore } from "@/lib/security/http";

export function guardInternalPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
}

export function internalRouteUnavailable() {
  if (process.env.NODE_ENV === "production") {
    return jsonNoStore({ error: "Not found." }, { status: 404 });
  }

  return null;
}
