import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { User } from "@/model/user.model";
import { getCurrentUser } from "@/lib/auth.lib";

export async function GET() {
  try {
    const decoded = await getCurrentUser();
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    await dataBase();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get user" },
      { status: 500 }
    );
  }
}
