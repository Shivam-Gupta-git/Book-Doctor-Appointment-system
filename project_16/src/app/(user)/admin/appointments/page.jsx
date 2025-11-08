import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
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
} from "react-icons/fa";
import { FaUserDoctor as FaUserDoctorIcon } from "react-icons/fa6";
import UpdateAppointmentStatus from "@/app/components/UpdateAppointmentStatus";
import DeleteAppointmentButton from "@/app/components/DeleteAppointmentButton";

export const metadata = {
  title: "Manage Appointments",
  description: "Admin page for managing appointments",
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

export default async function ManageAppointmentsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/admin/login");
  }

  await dataBase();
  let appointments = [];
  try {
    const rawData = await Appointment.find({})
      .populate("userId", "firstName lastName email phoneNumber")
      .populate("doctorId", "firstName lastName email phoneNumber department")
      .sort({ createdAt: -1 });
    appointments = JSON.parse(JSON.stringify(rawData));
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-100 to-blue-300  shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Manage Appointments</h1>
              <p className="text-gray-500 mt-1">
                View and manage all appointment bookings
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-700">{appointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
        {/* Back to Dashboard */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6"
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

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 border">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      {/* Appointment Details */}
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
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            <p className="font-medium">Reason:</p>
                            <p className="line-clamp-2">{appointment.reason}</p>
                          </div>
                          {appointment.notes && (
                            <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
                              <p className="font-medium text-gray-600">Activity Notes:</p>
                              <p className="line-clamp-3 whitespace-pre-wrap">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* User Details */}
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
                            User not found
                          </span>
                        )}
                      </td>

                      {/* Doctor Details */}
                      <td className="px-6 py-4">
                        {appointment.doctorId ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <FaUserDoctorIcon className="text-green-600 text-xs" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Dr. {appointment.doctorId.firstName}{" "}
                                  {appointment.doctorId.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {appointment.doctorId.department}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 ml-10">
                              📞 {appointment.doctorId.phoneNumber}
                            </p>
                            <p className="text-xs text-gray-600 ml-10">
                              ✉️ {appointment.doctorId.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Doctor not found
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(appointment.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <UpdateAppointmentStatus
                            appointmentId={appointment._id}
                            currentStatus={appointment.status}
                            currentTime={appointment.appointmentTime}
                          />
                          <DeleteAppointmentButton
                            appointmentId={appointment._id}
                          />
                        </div>
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
                Appointments will appear here when users book them
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
