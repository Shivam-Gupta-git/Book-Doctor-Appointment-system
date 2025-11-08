"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

export default function DeleteAppointmentButton({ appointmentId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!appointmentId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.message || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting the appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
      title="Delete Appointment"
    >
      <FaTrash />
    </button>
  );
}
