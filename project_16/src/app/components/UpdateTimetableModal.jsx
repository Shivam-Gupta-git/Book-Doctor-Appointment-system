"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTimesCircle } from "react-icons/fa";

export default function UpdateTimetableModal({ onClose }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [timetable, setTimetable] = useState({
    startTime: "",
    endTime: "",
    slots: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch("/api/doctor/timetable");
      const data = await response.json();

      if (data.success && data.timetable) {
        setTimetable({
          startTime: data.timetable.startTime || "",
          endTime: data.timetable.endTime || "",
          slots: data.timetable.slots || [],
        });
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/doctor/timetable", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: timetable.startTime,
          endTime: timetable.endTime,
          slots: timetable.slots.filter((slot) => slot.trim() !== ""),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Timetable updated successfully!");
        setShowModal(false);
        if (onClose) onClose();
        router.refresh();
      } else {
        alert(data.message || "Failed to update timetable");
      }
    } catch (error) {
      console.error("Error updating timetable:", error);
      alert("Failed to update timetable");
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setTimetable({
      ...timetable,
      slots: [...timetable.slots, ""],
    });
  };

  const updateTimeSlot = (index, value) => {
    const newSlots = [...timetable.slots];
    newSlots[index] = value;
    setTimetable({
      ...timetable,
      slots: newSlots,
    });
  };

  const removeTimeSlot = (index) => {
    const newSlots = timetable.slots.filter((_, i) => i !== index);
    setTimetable({
      ...timetable,
      slots: newSlots,
    });
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-700">
            Update Today's Timetable
          </h3>
          <button
            onClick={() => {
              setShowModal(false);
              if (onClose) onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimesCircle className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              required
              value={timetable.startTime}
              onChange={(e) =>
                setTimetable({ ...timetable, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              required
              value={timetable.endTime}
              onChange={(e) =>
                setTimetable({ ...timetable, endTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Available Time Slots
              </label>
              <button
                type="button"
                onClick={addTimeSlot}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Slot
              </button>
            </div>
            <div className="space-y-2">
              {timetable.slots.map((slot, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="time"
                    value={slot}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="HH:MM"
                  />
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {timetable.slots.length === 0 && (
                <p className="text-sm text-gray-500">
                  No time slots added. Click "Add Slot" to add available times.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Updating..." : "Update Timetable"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                if (onClose) onClose();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

