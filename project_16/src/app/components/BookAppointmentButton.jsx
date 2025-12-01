"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt, FaFileMedical, FaClock } from "react-icons/fa";

export default function BookAppointmentButton({ doctorId, doctorName }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: "",
    reason: "",
    notes: "",
  });

  // Fetch doctor's timetable when modal opens
  useEffect(() => {
    if (showModal && doctorId) {
      fetchDoctorTimetable();
    }
  }, [showModal, doctorId]);

  const fetchDoctorTimetable = async () => {
    setLoadingTimetable(true);
    try {
      const response = await fetch(`/api/doctors/${doctorId}/timetable`);
      const data = await response.json();
      if (data.success && data.timetable) {
        setTimetable(data.timetable);
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.appointmentDate || !formData.reason) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError("Please select a future date");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctorId,
          appointmentDate: formData.appointmentDate,
          reason: formData.reason,
          notes: formData.notes || "",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Appointment booked successfully! Admin will assign the time.");
        setFormData({
          appointmentDate: "",
          reason: "",
          notes: "",
        });
        setTimeout(() => {
          setShowModal(false);
          router.refresh();
        }, 1500);
      } else {
        setError(data.message || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Book Appointment
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Book Appointment
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setSuccess("");
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {doctorName && (
              <p className="text-sm text-gray-600 mb-4">
                Doctor: <span className="font-semibold">Dr. {doctorName}</span>
              </p>
            )}

            {/* Show doctor's today's timetable */}
            {timetable && timetable.startTime && timetable.endTime && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FaClock className="text-blue-600" />
                  Today's Schedule
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  <span className="font-medium">Working Hours:</span> {timetable.startTime} - {timetable.endTime}
                </p>
                {timetable.slots && timetable.slots.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Available Time Slots:</p>
                    <div className="flex flex-wrap gap-1">
                      {timetable.slots.map((slot, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {loadingTimetable && (
              <div className="mb-4 text-sm text-gray-500">Loading doctor's schedule...</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaFileMedical className="inline mr-2" />
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the reason for your appointment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional information..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

