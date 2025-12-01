import { NextResponse } from "next/server";
import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";

// GET - Fetch all doctors from database
export async function GET() {
  try {
    await dataBase();
    
    const doctors = await Doctordetails.find({})
      .select("firstName lastName email phoneNumber department specialization qualification experience availableDays")
      .sort({ createdAt: -1 });
    
    const doctorsData = JSON.parse(JSON.stringify(doctors));

    return NextResponse.json(
      { success: true, doctors: doctorsData, count: doctorsData.length },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

