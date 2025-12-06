import { NextResponse } from "next/server";

import { initialData } from "@/config/initial-data";
import { getPageData, savePageData } from "@/lib/server/storage";

const normalizePath = (p: string) => {
  if (!p) return "/";
  const withSlash = p.startsWith("/") ? p : `/${p}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Missing required query param: path" },
      { status: 400 }
    );
  }

  const normalized = normalizePath(path);

  const stored = await getPageData(normalized);

  if (stored) {
    return NextResponse.json(stored);
  }

  if (initialData[normalized as keyof typeof initialData]) {
    return NextResponse.json(initialData[normalized as keyof typeof initialData]);
  }

  return NextResponse.json(null, { status: 404 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const path = normalizePath(body?.path as string | undefined);
  const data = body?.data;

  if (!path || typeof data === "undefined") {
    return NextResponse.json(
      { error: "Body must include path and data" },
      { status: 400 }
    );
  }

  await savePageData(path, data);

  return NextResponse.json({ ok: true });
}
