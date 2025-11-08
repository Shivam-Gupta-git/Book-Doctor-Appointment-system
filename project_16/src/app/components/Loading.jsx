// "use client";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const loadingMessages = [
    "Initializing...",
    "Fetching data...",
    "Setting up environment...",
    "Almost ready...",
    "Done!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 25, 100));
      setMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 1000);

    // Simulate redirect after complete
    if (progress >= 100) {
      setTimeout(() => {
        console.log("Redirecting...");
        // Example redirect: window.location.href = "/home";
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="w-[100%] flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-500 via-gray-800 to-gray-900 text-white">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-8"></div>

      {/* Loading Message */}
      <h1 className="text-2xl font-semibold transition-all duration-500 ease-in-out">
        {loadingMessages[messageIndex]}
      </h1>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-gray-700 mt-6 rounded-full overflow-hidden">
        <div
          className="h-2 bg-blue-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Subtext */}
      <p className="mt-4 text-gray-400 text-sm">
        {progress < 100 ? "Please wait..." : "Redirecting..."}
      </p>
    </div>
  );
}