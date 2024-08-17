import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  const url = req.url;

  if (
    (!token && url.includes("/update/")) ||
    (!token && url.includes("admin/order-dashboard"))
  ) {
    return NextResponse.redirect("http://localhost:3000/");
  }

  return NextResponse.next();
}
