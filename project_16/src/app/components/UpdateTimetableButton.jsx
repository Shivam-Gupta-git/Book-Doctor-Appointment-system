"use client";

import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import UpdateTimetableModal from "./UpdateTimetableModal";

export default function UpdateTimetableButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
      >
        <FaEdit className="inline mr-2" />
        Update Timetable
      </button>
      {showModal && <UpdateTimetableModal onClose={() => setShowModal(false)} />}
    </>
  );
}

