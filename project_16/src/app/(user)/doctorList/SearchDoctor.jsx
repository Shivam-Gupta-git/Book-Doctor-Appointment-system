"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchDoctor = ({ doctorData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const router = useRouter();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      // Filter doctors based on search term
      const filtered = doctorData.filter((doctor) => {
        const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });
      setFilteredDoctors(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredDoctors([]);
      setShowSuggestions(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    const username = `${doctor.firstName.toLowerCase()}-${doctor.lastName.toLowerCase()}`;
    router.push(`/doctorList/${username}`);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filteredDoctors.length > 0) {
      handleDoctorSelect(filteredDoctors[0]);
    }
  };

  return (
    <div className="relative w-[40%]">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search doctor name..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => searchTerm && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full h-[40px] outline-0 border border-gray-300 rounded-3xl px-4 pr-12 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
        </div>
      </form>

      {showSuggestions && filteredDoctors.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={index}
              onClick={() => handleDoctorSelect(doctor)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{doctor.department}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && filteredDoctors.length === 0 && searchTerm.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="px-4 py-3 text-gray-500 text-center">
            No doctors found for "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDoctor;
