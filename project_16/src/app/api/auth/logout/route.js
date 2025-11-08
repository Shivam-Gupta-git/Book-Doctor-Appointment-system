import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/auth.lib";

export async function POST() {
  try {
    removeAuthCookie();
    return NextResponse.json(
      { success: true, message: "Logout successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
