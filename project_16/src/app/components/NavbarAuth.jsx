"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FaUser, FaSignOutAlt, FaUserShield, FaCalendarCheck } from "react-icons/fa";
import { FaRegUserCircle } from "react-icons/fa";

export default function NavbarAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false)

  const handelToggel = () => setIsOpen((pre) => !pre)
  // console.log(isOpen)

  useEffect(() => {
    checkAuth();
  }, [pathname]); // Re-check auth when route changes

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setUser(null);
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state (optional - can show a spinner or nothing)
  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show logout button and user info only when user/admin is logged in
  if (user && (user.role === "user" || user.role === "admin")) {
    return (
      <div className="flex items-center gap-4">
        <div className=" relative">
        <div className="h-[40px] w-[40px] border border-white rounded-full bg-blue-500 flex items-center justify-center cursor-pointer shadow-sm mr-5" onClick={handelToggel}>
        <FaRegUserCircle  className="text-2xl text-white"/>
        </div>
        {
          isOpen === true ? <div className=" w-[200px] bg-blue-400 border-blue-500 absolute top-0% right-[-15%] mt-2.5  py-3 flex flex-col items-start gap-2 rounded-b-lg shadow-sm shadow-gray-300 ">
          <div className="flex items-center gap-2 px-3 py-1  bg-opacity-20 rounded-r-lg  text-white hover:bg-white hover:text-black duration-150">
          <FaUser />
          <span className="text-sm font-medium">{user.firstName}</span>
          </div>

          {user.role === "admin" && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-3 py-1  bg-opacity-20 rounded-r-lg  text-white hover:bg-white hover:text-black duration-150"
          >
            <FaUserShield />
            <span className="text-sm">Admin</span>
          </Link>
        )}

        <Link
          href="/appointments"
          className="flex items-center gap-2 px-3 py-1  bg-opacity-20 rounded-r-lg  text-white hover:bg-white hover:text-black duration-150"
          title="My Appointments"
        >
          <FaCalendarCheck />
          <span className="text-sm">Appointments</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1  bg-opacity-20 rounded-r-lg cursor-pointer  text-white hover:bg-white hover:text-black duration-150 "
          title="Logout"
        >
          <FaSignOutAlt />
          <span className="text-sm">Logout</span>
        </button>
          </div> : null
        }
        
        </div>
      </div>
    );

  }

  // Show login/register buttons when not logged in
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-blue-600"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 bg-white hover:bg-gray-100 text-blue-600 rounded-lg transition-all font-semibold"
      >
        Register
      </Link>
    </div>
  );



}
