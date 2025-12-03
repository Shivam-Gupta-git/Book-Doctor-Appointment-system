import { dataBase } from "@/lib/database.lib";
import { Appointment } from "@/model/appointment.model";
import { getCurrentUser } from "@/lib/auth.lib";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { Doctordetails } from "@/model/doctors.model";
import CancelAppointmentButton from "@/app/components/CancelAppointmentButton";
import RescheduleAppointmentButton from "@/app/components/RescheduleAppointmentButton";

export const metadata = {
  title: "My Appointments",
  description: "View and manage your appointments",
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
    month: "long",
    day: "numeric",
  });
};

export default async function MyAppointmentsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  await dataBase();
  let appointments = [];
  const today = new Date().toISOString().split("T")[0];
  
  try {
    // Fetch appointments excluding cancelled ones
    const rawData = await Appointment.find({ 
      userId: currentUser.userId,
      status: { $ne: "cancelled" } // Exclude cancelled appointments
    })
      .populate("doctorId", "firstName lastName email phoneNumber department")
      .sort({ appointmentDate: 1, createdAt: -1 }); // Sort by appointment date
    appointments = JSON.parse(JSON.stringify(rawData));
    

    const doctorTimetables = new Map();
    
    for (let appointment of appointments) {
      if (appointment.doctorId) {
        try {
          // Get doctor ID - handle both populated object and direct ID
          const doctorId = appointment.doctorId._id || appointment.doctorId;
          const doctorIdStr = doctorId.toString();
          
          // Check if we already fetched this doctor's timetable
          if (!doctorTimetables.has(doctorIdStr)) {
            try {
              // Use lean() to get plain JavaScript object directly
              const doctor = await Doctordetails.findById(doctorId).select("timetable").lean();
              if (doctor) {
                // Timetable is stored as Mixed type, so it should be a plain object
                const timetableObj = doctor.timetable || {};
                
                // Debug: Log the entire timetable structure
                console.log(`Doctor ${doctorIdStr} timetable structure:`, {
                  hasTimetable: !!doctor.timetable,
                  timetableType: typeof doctor.timetable,
                  timetableKeys: Object.keys(timetableObj),
                  today: today,
                  todayValue: timetableObj[today]
                });
                
                // Get today's timetable
                let todayTimetable = timetableObj[today] || null;
                
                // If timetable exists but is in a different format, try to normalize it
                if (!todayTimetable && Object.keys(timetableObj).length > 0) {
                  // Try to find the most recent timetable entry
                  const dates = Object.keys(timetableObj).sort().reverse();
                  if (dates.length > 0) {
                    console.log(`No timetable for ${today}, but found entries for:`, dates);
                  }
                }
                
                // Validate timetable structure
                if (todayTimetable) {
                  if (!todayTimetable.startTime || !todayTimetable.endTime) {
                    console.warn(`Timetable for ${today} is missing startTime or endTime:`, todayTimetable);
                    todayTimetable = null;
                  } else {
                    console.log(`✓ Found valid timetable for doctor ${doctorIdStr} on ${today}:`, {
                      startTime: todayTimetable.startTime,
                      endTime: todayTimetable.endTime,
                      slotsCount: todayTimetable.slots?.length || 0
                    });
                  }
                } else {
                  console.log(`✗ No timetable found for doctor ${doctorIdStr} on ${today}`);
                }
                
                doctorTimetables.set(doctorIdStr, todayTimetable);
              } else {
                console.log(`✗ Doctor ${doctorIdStr} not found in database`);
                doctorTimetables.set(doctorIdStr, null);
              }
            } catch (err) {
              console.error(`Error fetching timetable for doctor ${doctorIdStr}:`, err);
              doctorTimetables.set(doctorIdStr, null);
            }
          }
          
          // Attach timetable to appointment
          appointment.doctorTimetable = doctorTimetables.get(doctorIdStr) || null;
        } catch (error) {
          console.error("Error processing appointment timetable:", error);
          appointment.doctorTimetable = null;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400 via-blue-100 to-blue-300 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-700">My Appointments</h1>
              <p className="text-gray-500 mt-1">
                View and manage your appointment bookings
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-700">{appointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Home */}
        <Link
          href="/"
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
          Back to Home
        </Link>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
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
                      {/* Appointment Details */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(appointment.appointmentDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaClock className="text-gray-400" />
                            <span>
                              {appointment.appointmentTime || "Time to be assigned"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            <p className="font-medium">Reason:</p>
                            <p className="line-clamp-2">{appointment.reason}</p>
                          </div>
                        </div>
                      </td>

                      {/* Doctor Details */}
                      <td className="px-6 py-4">
                        {appointment.doctorId ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <FaUserDoctor className="text-green-600 text-xs" />
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
                            {/* Show doctor's today's timetable */}
                            {(() => {
                              const timetable = appointment.doctorTimetable;
                              if (timetable && timetable.startTime && timetable.endTime) {
                                return (
                                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                                      <FaClock className="text-blue-600" />
                                      Today's Schedule
                                    </p>
                                    <p className="text-xs text-blue-700 mb-1">
                                      <span className="font-medium">Hours:</span> {timetable.startTime} - {timetable.endTime}
                                    </p>
                                    {timetable.slots && Array.isArray(timetable.slots) && timetable.slots.length > 0 && (
                                      <div className="mt-1">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Available Slots:</p>
                                        <div className="flex flex-wrap gap-1">
                                          {timetable.slots.map((slot, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                              {slot}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              // Only show "No schedule" if we explicitly set it to null (meaning we checked and it doesn't exist)
                              if (timetable === null) {
                                return (
                                  <div className="mt-2 text-xs text-gray-400 italic">
                                    No schedule set for today
                                  </div>
                                );
                              }
                              // If undefined, don't show anything (might still be loading or error)
                              return null;
                            })()}
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
                          {appointment.status !== "cancelled" &&
                            appointment.status !== "completed" && (
                              <>
                                <RescheduleAppointmentButton
                                  appointmentId={appointment._id}
                                  currentDate={appointment.appointmentDate}
                                />
                                <CancelAppointmentButton
                                  appointmentId={appointment._id}
                                />
                              </>
                            )}
                          {appointment.status === "cancelled" && (
                            <span className="text-xs text-gray-400">
                              Cancelled
                            </span>
                          )}
                          {appointment.status === "completed" && (
                            <span className="text-xs text-gray-400">
                              Completed
                            </span>
                          )}
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
                You haven't booked any appointments yet.
              </p>
              <Link
                href="/doctorList"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse Doctors →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

