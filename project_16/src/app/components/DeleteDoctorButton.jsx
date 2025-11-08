"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";

export default function DeleteDoctorButton({ doctorId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!doctorId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor profile? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        router.refresh();
      } else {
        alert(data.message || "Failed to delete doctor");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting the doctor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
      title="Delete Doctor"
      aria-label="Delete Doctor"
    >
      <FaTrash />
    </button>
  );
}
