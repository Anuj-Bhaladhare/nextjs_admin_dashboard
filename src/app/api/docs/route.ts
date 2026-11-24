
import { NextResponse } from "next/server";
import swaggerConfig from "@/lib/swagger/swagger.config";

export function GET() {
  return NextResponse.json(swaggerConfig, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
