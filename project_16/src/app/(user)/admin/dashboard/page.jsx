import { dataBase } from "@/lib/database.lib";
import { User } from "@/model/user.model";
import { Doctordetails } from "@/model/doctors.model";
import { getCurrentUser } from "@/lib/auth.lib";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FaUsers,
  FaHospital,
  FaChartLine,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import LogoutButton from "@/app/components/LogoutButton";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the healthcare system",
};

export default async function AdminDashboard() {
  const currentUser = await getCurrentUser();

  // Check if user is authenticated and is admin
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/admin/login");
  }

  await dataBase();

  // Fetch statistics
  let stats = {
    totalUsers: 0,
    totalAdmins: 0,
    totalDoctors: 0,
    totalDepartments: 0,
  };

  try {
    const [users, admins, doctors] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Doctordetails.countDocuments(),
      Doctordetails.distinct("department"),
    ]);

    stats.totalUsers = users;
    stats.totalAdmins = admins;
    stats.totalDoctors = doctors;

    const departments = await Doctordetails.distinct("department");
    stats.totalDepartments = departments.length;
  } catch (error) {
    console.error("Error fetching stats:", error);
  }

  // Fetch recent users
  let recentUsers = [];
  try {
    const users = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");
    recentUsers = JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching recent users:", error);
  }

  // Fetch recent doctors
  let recentDoctors = [];
  try {
    const doctors = await Doctordetails.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    recentDoctors = JSON.parse(JSON.stringify(doctors));
  } catch (error) {
    console.error("Error fetching recent doctors:", error);
  }

  return (
    <div className="min-h-screen bg-[url('/images/hospital2.jpg')] bg-cover bg-center">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-400/70 via-blue-100/70 to-blue-300/70 text-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Welcome back, {currentUser?.userId ? "Admin" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/50 rounded-xl shadow-sm hover:shadow-gray-400 p-6 hover:shadow-sm duration-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <FaUsers className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl shadow-sm hover:shadow-gray-400 p-6 hover:shadow-sm duration-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Admins
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalAdmins}
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaUser className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl shadow-sm hover:shadow-gray-400 p-6 hover:shadow-sm duration-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalDoctors}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <FaUserDoctor className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 rounded-xl shadow-sm hover:shadow-gray-400 p-6 hover:shadow-sm duration-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalDepartments}
                </p>
              </div>
              <div className="bg-orange-100 p-4 rounded-full">
                <FaHospital className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/50 rounded-xl shadow-sm shadow-gray-400 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              href="/admin/appointments"
              className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-2xl text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Appointments</h3>
                  <p className="text-sm text-gray-600">Manage bookings</p>
                </div>
              </div>
            </Link>
            <Link
              href="/admin/doctors"
              className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <FaUserDoctor className="text-2xl text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Manage Doctors
                  </h3>
                  <p className="text-sm text-gray-600">Add, edit doctors</p>
                </div>
              </div>
            </Link>
            <Link
              href="/admin/doctors/add"
              className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <FaUserDoctor className="text-2xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Add Doctor</h3>
                  <p className="text-sm text-gray-600">Create new profile</p>
                </div>
              </div>
            </Link>
            <Link
              href="/doctorList"
              className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <FaUserDoctor className="text-2xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">View Doctors</h3>
                  <p className="text-sm text-gray-600">Browse all doctors</p>
                </div>
              </div>
            </Link>
            <Link
              href="/"
              className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all duration-500"
            >
              <div className="flex items-center gap-3">
                <FaChartLine className="text-2xl text-orange-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">View Home</h3>
                  <p className="text-sm text-gray-600">Go to home page</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Users and Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white/50 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Users
            </h2>
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg "
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      User
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No users yet</p>
              )}
            </div>
          </div>

          {/* Recent Doctors */}
          <div className="bg-white/50 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Doctors
            </h2>
            <div className="space-y-3">
              {recentDoctors.length > 0 ? (
                recentDoctors.map((doctor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50/70 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUserDoctor className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {doctor.department}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Doctor
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No doctors yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
