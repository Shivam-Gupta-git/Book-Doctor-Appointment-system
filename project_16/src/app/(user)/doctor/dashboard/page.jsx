import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEdit,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import LogoutButton from "@/app/components/LogoutButton";
import UpdateAppointmentStatusDoctor from "@/app/components/UpdateAppointmentStatusDoctor";
import Navbar from "@/app/components/Navbar";
import UpdateTimetableButton from "@/app/components/UpdateTimetableButton";

export const metadata = {
  title: "Doctor Dashboard",
  description: "Doctor dashboard for managing appointments",
};

const getStatusBadge = (status) => {
  const statusConfig = {
    pending: {
      icon: FaSpinner,
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
    },
    confirmed: {
      icon: FaCheckCircle,
      color: "bg-blue-100 text-blue-800",
      label: "Confirmed",
    },
    completed: {
      icon: FaCheckCircle,
      color: "bg-green-100 text-green-800",
      label: "Completed",
    },
    cancelled: {
      icon: FaTimesCircle,
      color: "bg-red-100 text-red-800",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${config.color}`}
    >
      <Icon className="text-xs" />
      {config.label}
    </span>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "Not assigned";
  return timeString;
};

export default async function DoctorDashboard() {
  const currentUser = await getCurrentUser();

  // Check if user is authenticated and is doctor
  if (!currentUser || currentUser.role !== "doctor") {
    redirect("/doctor/login");
  }

  await dataBase();

  // Find doctor profile
  const doctor = await Doctordetails.findOne({ userId: currentUser.userId });
  if (!doctor) {
    redirect("/doctor/login");
  }

  // Fetch appointments for this doctor - only present and future dates, exclude cancelled
  let appointments = [];
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const rawData = await Appointment.find({ 
      doctorId: doctor._id,
      appointmentDate: { $gte: today }, // Only appointments from today onwards
      status: { $ne: "cancelled" } // Exclude cancelled appointments
    })
      .populate("userId", "firstName lastName email phoneNumber")
      .sort({ appointmentDate: 1, createdAt: -1 }); // Sort by date ascending (earliest first)
    appointments = JSON.parse(JSON.stringify(rawData));
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }

  // Get today's timetable
  const today = new Date().toISOString().split("T")[0];
  const timetable = doctor.timetable || {};
  const todayTimetable = timetable[today] || null;

  // Calculate statistics (only for present/future appointments)
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* <Navbar /> */}
      
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-100 to-blue-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Doctor Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Welcome, Dr. {doctor.firstName} {doctor.lastName}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FaCalendarAlt className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-full">
                <FaSpinner className="text-2xl text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.confirmed}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FaCheckCircle className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Cancelled</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.cancelled}
                </p>
              </div>
              <div className="bg-red-100 p-4 rounded-full">
                <FaTimesCircle className="text-2xl text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Timetable */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              Today's Timetable ({new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })})
            </h2>
            <UpdateTimetableButton />
          </div>
          {todayTimetable && todayTimetable.startTime && todayTimetable.endTime ? (
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-semibold">Working Hours:</span>{" "}
                {todayTimetable.startTime} - {todayTimetable.endTime}
              </p>
              {todayTimetable.slots && todayTimetable.slots.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-600 mb-2">
                    Available Time Slots:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {todayTimetable.slots.map((slot, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">
              No timetable set for today. Click "Update Timetable" to set your schedule.
            </p>
          )}
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-700">
              My Appointments ({appointments.length})
            </h2>
          </div>

          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(appointment.appointmentDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaClock className="text-gray-400" />
                            <span>{formatTime(appointment.appointmentTime)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            <p className="font-medium">Reason:</p>
                            <p className="line-clamp-2">{appointment.reason}</p>
                          </div>
                          {appointment.notes && (
                            <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                              <p className="font-medium text-gray-600">Notes:</p>
                              <p className="line-clamp-3 whitespace-pre-wrap">
                                {appointment.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {appointment.userId ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaUser className="text-blue-600 text-xs" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {appointment.userId.firstName}{" "}
                                  {appointment.userId.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {appointment.userId.email}
                                </p>
                              </div>
                            </div>
                            {appointment.userId.phoneNumber && (
                              <p className="text-xs text-gray-600 ml-10">
                                📞 {appointment.userId.phoneNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Patient not found
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(appointment.status)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <UpdateAppointmentStatusDoctor
                          appointmentId={appointment._id}
                          currentStatus={appointment.status}
                          currentTime={appointment.appointmentTime}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <FaCalendarAlt className="text-4xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm mt-2">
                Appointments will appear here when patients book with you
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
