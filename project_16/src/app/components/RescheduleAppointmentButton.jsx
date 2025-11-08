"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaCalendarAlt } from "react-icons/fa";

export default function RescheduleAppointmentButton({
  appointmentId,
  currentDate,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newDate, setNewDate] = useState("");

  const handleReschedule = async () => {
    if (!appointmentId || !newDate) {
      alert("Please select a new date");
      return;
    }

    // Validate date is in the future
    const selectedDate = new Date(newDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Please select a future date");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/appointments/${appointmentId}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentDate: newDate,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Appointment rescheduled successfully! Admin will assign a new time.");
        setShowModal(false);
        setNewDate("");
        router.refresh();
      } else {
        alert(data.message || "Failed to reschedule appointment");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      alert("Something went wrong while rescheduling the appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-all"
        title="Reschedule Appointment"
      >
        <FaCalendarAlt />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reschedule Appointment
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Current Date:{" "}
                  <span className="font-semibold">
                    {new Date(currentDate).toLocaleDateString()}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  New Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Admin will assign a new time for the rescheduled date
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewDate("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={loading || !newDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Rescheduling..." : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

