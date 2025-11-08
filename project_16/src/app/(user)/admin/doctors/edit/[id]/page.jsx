"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCheck,
  FaMapMarkerAlt,
  FaClock,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function EditDoctorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const tab = searchParams.get("tab") || "profile";
  const doctorId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    email: "",
    phoneNumber: "",
    department: "",
    specialization: [],
    qualification: [],
    experience: "",
    bio: "",
    availableDays: [],
    address: {
      street: "",
      city: "",
      state: "",
      pinCode: "",
      country: "",
    },
  });

  const [newSpecialization, setNewSpecialization] = useState("");
  const [newQualification, setNewQualification] = useState("");

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;

      try {
        const response = await fetch(`/api/admin/doctors/${doctorId}`);
        const data = await response.json();

        if (data.success) {
          setFormData({
            firstName: data.doctor.firstName || "",
            lastName: data.doctor.lastName || "",
            gender: data.doctor.gender || "",
            age: data.doctor.age || "",
            email: data.doctor.email || "",
            phoneNumber: data.doctor.phoneNumber || "",
            department: data.doctor.department || "",
            specialization: data.doctor.specialization || [],
            qualification: data.doctor.qualification || [],
            experience: data.doctor.experience || "",
            bio: data.doctor.bio || "",
            availableDays: data.doctor.availableDays || [],
            address: {
              street: data.doctor.address?.street || "",
              city: data.doctor.address?.city || "",
              state: data.doctor.address?.state || "",
              pinCode: data.doctor.address?.pinCode || "",
              country: data.doctor.address?.country || "",
            },
          });
        } else {
          setError("Doctor not found");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setError("Failed to load doctor data");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSpecializationAdd = () => {
    if (newSpecialization.trim()) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, newSpecialization.trim()],
      });
      setNewSpecialization("");
    }
  };

  const handleQualificationAdd = () => {
    if (newQualification.trim()) {
      setFormData({
        ...formData,
        qualification: [...formData.qualification, newQualification.trim()],
      });
      setNewQualification("");
    }
  };

  const handleRemoveSpecialization = (index) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter((_, i) => i !== index),
    });
  };

  const handleRemoveQualification = (index) => {
    setFormData({
      ...formData,
      qualification: formData.qualification.filter((_, i) => i !== index),
    });
  };

  const handleDayToggle = (day) => {
    if (formData.availableDays.includes(day)) {
      setFormData({
        ...formData,
        availableDays: formData.availableDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        availableDays: [...formData.availableDays, day],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Doctor updated successfully!");
        setTimeout(() => {
          router.push("/admin/doctors");
        }, 1500);
      } else {
        setError(data.message || "Failed to update doctor");
      }
    } catch (error) {
      console.error("Error updating doctor:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/doctors"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Doctors List
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <FaUserDoctor className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Doctor Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Update doctor information, location, and availability
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => router.push(`/admin/doctors/edit/${doctorId}`)}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
                tab === "profile"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <FaUserDoctor className="inline mr-2" />
              Profile
            </button>
            <button
              onClick={() =>
                router.push(`/admin/doctors/edit/${doctorId}?tab=location`)
              }
              className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
                tab === "location"
                  ? "text-purple-600 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              <FaMapMarkerAlt className="inline mr-2" />
              Location & Time
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {tab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Basic Information
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  required
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  Professional Information
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years) *
                </label>
                <input
                  type="text"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleSpecializationAdd())
                    }
                    placeholder="Add specialization"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleSpecializationAdd}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialization(index)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleQualificationAdd())
                    }
                    placeholder="Add qualification"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleQualificationAdd}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.qualification.map((qual, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {qual}
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaTimes />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Doctor's biography..."
                />
              </div>
            </div>
          )}

          {/* Location & Time Tab */}
          {tab === "location" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-purple-600" />
                  Address Information
                </h2>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street *
                </label>
                <input
                  type="text"
                  name="address.street"
                  required
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="address.city"
                  required
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="address.state"
                  required
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code *
                </label>
                <input
                  type="text"
                  name="address.pinCode"
                  required
                  value={formData.address.pinCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="address.country"
                  required
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                  <FaClock className="text-purple-600" />
                  Available Days *
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <label
                      key={day}
                      className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-purple-50"
                      style={{
                        borderColor: formData.availableDays.includes(day)
                          ? "#9333ea"
                          : "#e5e7eb",
                        backgroundColor: formData.availableDays.includes(day)
                          ? "#f3e8ff"
                          : "transparent",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.availableDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="mr-2 w-4 h-4 text-purple-600 focus:ring-purple-500 rounded"
                      />
                      <span className="text-sm font-medium">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Select the days when the doctor is available for appointments
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-4">
            <Link
              href="/admin/doctors"
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaCheck />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
