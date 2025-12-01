import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaPlus, FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import DeleteDoctorButton from "@/app/components/DeleteDoctorButton";

export const metadata = {
  title: "Manage Doctors",
  description: "Admin page for managing doctors",
};

export default async function ManageDoctorsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/admin/login");
  }

  await dataBase();
  let doctors = [];
  try {
    const rawData = await Doctordetails.find({}).sort({ createdAt: -1 });
    doctors = JSON.parse(JSON.stringify(rawData));
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-100 to-blue-300 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Manage Doctors</h1>
              <p className="text-gray-500 mt-1">
                Add, edit, and manage doctor profiles
              </p>
            </div>
            <Link
              href="/admin/doctors/add"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-400 via-blue-200 to-blue-300 text-gray-800 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg border-2 border-blue-400 "
            >
              <FaPlus />
              Add New Doctor
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-6"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Dashboard
        </Link>

        {/* Doctors List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Today's Schedule
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length > 0 ? (
                  doctors.map((doctor) => (
                    <tr key={doctor._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <FaUserDoctor className="text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {doctor.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <FaMapMarkerAlt className="mr-1" />
                          {doctor.address?.city}, {doctor.address?.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doctor.experience} years
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {(() => {
                          const today = new Date().toISOString().split("T")[0];
                          const timetable = doctor.timetable || {};
                          const todayTimetable = timetable[today];
                          
                          if (todayTimetable && todayTimetable.startTime && todayTimetable.endTime) {
                            return (
                              <div className="space-y-1">
                                <div className="font-semibold text-gray-700">
                                  {todayTimetable.startTime} - {todayTimetable.endTime}
                                </div>
                                {todayTimetable.slots && todayTimetable.slots.length > 0 && (
                                  <div className="text-xs text-gray-600">
                                    {todayTimetable.slots.length} slot{todayTimetable.slots.length !== 1 ? 's' : ''} available
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return <span className="text-gray-400 italic">Not set</span>;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/doctors/edit/${doctor._id}`}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit Doctor"
                          >
                            <FaEdit />
                          </Link>
                          <Link
                            href={`/admin/doctors/edit/${doctor._id}?tab=location`}
                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-lg transition-all"
                            title="Update Location & Time"
                          >
                            <FaMapMarkerAlt />
                          </Link>
                          <DeleteDoctorButton doctorId={doctor._id} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <FaUserDoctor className="text-4xl mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No doctors found</p>
                      <p className="text-sm mt-2">
                        Add your first doctor to get started
                      </p>
                      <Link
                        href="/admin/doctors/add"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                      >
                        <FaPlus />
                        Add Doctor
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
