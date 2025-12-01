import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import mongoose from "mongoose";

// GET - Fetch doctor's today's timetable (public access for booking)
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID" },
        { status: 400 }
      );
    }

    await dataBase();

    const doctor = await Doctordetails.findById(id);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    const timetable = doctor.timetable || {};
    const todayTimetable = timetable[today] || null;

    return NextResponse.json(
      {
        success: true,
        timetable: todayTimetable,
        date: today,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching doctor timetable:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch timetable" },
      { status: 500 }
    );
  }
}

