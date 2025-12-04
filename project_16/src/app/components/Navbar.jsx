import Link from "next/link";
import NavbarAuth from "./NavbarAuth";
import { FaUserDoctor } from "react-icons/fa6";

const Navbar = () => {
  return (
    <header className="w-[100%] h-[60px] border flex flex-row sticky top-0 left-0 bg-blue-400 border-blue-500 shadow-sm shadow-gray-300 z-100 justify-between">
      <div className=" flex items-center px-7 ">
        <Link href="/">
          <div className="flex flex-col items-center justify-center text-gray-800">
          <FaUserDoctor className="text-4xl mt-2 text-gray-200"/>
          <p className="text-[12px] font-bold text-gray-200">DOC</p>
          </div>
        </Link>
      </div>
      <div className=" flex items-center justify-between text-white text-[18px] font-bold pr-5 ">
        <ul className="flex flex-row gap-6">
          <li>
            <Link
              href="/"
              className="hover:border-b-2 duration-100 hover:text-gray-100"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/doctorList"
              className="hover:border-b-2 duration-100 hover:text-gray-100"
            >
              DoctorsList
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="hover:border-b-2 duration-100 hover:text-gray-100"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="hover:border-b-2 duration-100 hover:text-gray-100"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/feedback"
              className="hover:border-b-2 duration-100 hover:text-gray-100"
            >
              Feedback
            </Link>
          </li>
        </ul>
      </div>
      <div className=" flex items-center justify-center p-2">
        <NavbarAuth />
      </div>
    </header>
  );
};

export default Navbar;
