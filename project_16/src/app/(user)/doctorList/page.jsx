import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import Link from "next/link";
import SearchDoctor from "./SearchDoctor";
import AuthWrapper from "@/app/components/AuthWrapper";

export const metadata = {
  title: "Doctor Page",
  description: "this is doctor  page",
  authors: [
    { name: "shivam gupta" },
    { name: "shivam technical", url: "shivamtechnical.com" },
  ],
};

const Doctor = async () => {
  let doctorData = [];
  try {
    await dataBase();
    const rawData = await Doctordetails.find({});

    doctorData = JSON.parse(JSON.stringify(rawData));
    console.log("doctor data fetching successfully");
  } catch (error) {
    console.error("doctor data fetching failed", error);
  }

  return (
    <AuthWrapper>
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
        <div className="w-full flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            👨‍⚕️ Doctors Dashboard
          </h1>
          <SearchDoctor doctorData={doctorData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorData.map((items, index) => (
            <div
              key={index}
              className="w-full h-auto bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all p-5"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Dr. {items.firstName} {items.lastName}
              </h2>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {items.bio || "No bio available."}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-white bg-green-600 px-3 py-1 rounded-full">
                  {items.department}
                </span>
                {items.qualification?.slice(0, 2).map((qual, i) => (
                  <span
                    key={i}
                    className="text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded-full"
                  >
                    {qual}
                  </span>
                ))}
              </div>

              <p className="text-sm text-gray-700 leading-snug">
                <span className="font-semibold">Address:</span>{" "}
                {items.address.street}, {items.address.city},{" "}
                {items.address.state} - {items.address.pinCode},{" "}
                {items.address.country}
              </p>

              <div className="mt-3 flex flex-col gap-1 text-sm text-gray-800">
                <p>
                  📞 <span className="font-semibold">{items.phoneNumber}</span>
                </p>
                <p>
                  ✉️ <span className="font-semibold">{items.email}</span>
                </p>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500">
                  {items.experience} years experience
                </span>
                <Link
                  href={`/doctorList/${items.firstName.toLowerCase()}-${items.lastName.toLowerCase()}`}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-all cursor-pointer inline-block"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthWrapper>
  );
};
export default Doctor;
