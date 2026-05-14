import { NextResponse } from "next/server";

type JsonResponseInit = {
  status?: number;
  headers?: HeadersInit;
};

function normalizeHeaderValue(
  headers: Headers,
  key: string,
) {
  const value = headers.get(key);

  return value?.trim() || null;
}

export function jsonNoStore(
  payload: unknown,
  init: JsonResponseInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(payload, {
    ...init,
    headers,
  });
}

export function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedProto =
    normalizeHeaderValue(request.headers, "x-forwarded-proto") ?? url.protocol.replace(":", "");
  const forwardedHost =
    normalizeHeaderValue(request.headers, "x-forwarded-host") ?? url.host;

  return `${forwardedProto}://${forwardedHost}`;
}

export function isSameOriginRequest(request: Request) {
  const origin = normalizeHeaderValue(request.headers, "origin");

  if (!origin) {
    return true;
  }

  return origin === getRequestOrigin(request);
}

export function getClientIp(request: Request) {
  const forwardedFor = normalizeHeaderValue(request.headers, "x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    normalizeHeaderValue(request.headers, "cf-connecting-ip") ??
    normalizeHeaderValue(request.headers, "x-real-ip") ??
    "unknown"
  );
}
