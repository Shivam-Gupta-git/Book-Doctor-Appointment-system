import { dataBase } from "@/lib/database.lib";
import { Doctordetails } from "@/model/doctors.model";
import Link from "next/link";
import { FaUserDoctor } from "react-icons/fa6";
import {
  FaHospital,
  FaStethoscope,
  FaHeartbeat,
  FaClock,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export const metadata = {
  title: "Home",
  description:
    "Find the best doctors for your healthcare needs. Browse by specialty, location, and experience.",
};

export default async function Home() {
  await dataBase();

  let doctorData = [];
  let stats = {
    totalDoctors: 0,
    departments: [],
    totalExperience: 0,
  };

  try {
    const rawData = await Doctordetails.find({});
    doctorData = JSON.parse(JSON.stringify(rawData));

    // Calculate statistics
    stats.totalDoctors = doctorData.length;
    stats.departments = [...new Set(doctorData.map((doc) => doc.department))];
    stats.totalExperience = doctorData.reduce(
      (sum, doc) => sum + parseInt(doc.experience || 0),
      0
    );

    // Get featured doctors (first 6 doctors)
    doctorData = doctorData.slice(0, 6);

    console.log("Home page data fetched successfully");
  } catch (error) {
    console.error("Error fetching data for home page:", error);
  }

  const services = [
    {
      icon: FaStethoscope,
      title: "General Consultation",
      description: "Expert medical consultations for all your health concerns",
    },
    {
      icon: FaHeartbeat,
      title: "Specialized Care",
      description: "Access to specialists across multiple medical fields",
    },
    {
      icon: FaHospital,
      title: "Emergency Services",
      description: "24/7 emergency medical care when you need it most",
    },
    {
      icon: FaClock,
      title: "Appointment Booking",
      description: "Easy online appointment booking system",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 px-4 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-400/10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Find Your Perfect
                <span className="text-blue-400 block">Healthcare Provider</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with experienced doctors, specialists, and healthcare
                professionals tailored to your needs. Your health is our
                priority.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/doctorList"
                  className="bg-gradient-to-br from-blue-400 via-blue-100 to-blue-300 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Browse Doctors
                </Link>
                <Link
                  href="/contact"
                  className="bg-white text-blue-600 border-2 border-blue-300 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-blue-100 to-blue-300 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                  <FaUserDoctor className="text-8xl text-blue-600 mx-auto mb-4" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.totalDoctors}+
                    </div>
                    <div className="text-gray-600">Expert Doctors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <FaUserDoctor className="text-4xl text-blue-600 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stats.totalDoctors}
              </div>
              <div className="text-gray-600 font-medium">Expert Doctors</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <FaHospital className="text-4xl text-green-600 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stats.departments.length}
              </div>
              <div className="text-gray-600 font-medium">Departments</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <FaClock className="text-4xl text-purple-600 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stats.totalExperience}+
              </div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <FaHeartbeat className="text-4xl text-orange-600 mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                24/7
              </div>
              <div className="text-gray-600 font-medium">Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      {doctorData.length > 0 && (
        <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Doctors
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Meet our experienced healthcare professionals ready to serve you
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctorData.map((doctor, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <FaUserDoctor className="text-2xl text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-blue-600 font-medium">
                          {doctor.department}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {doctor.bio ||
                        "Experienced healthcare professional dedicated to your well-being."}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {doctor.department}
                      </span>
                      {doctor.qualification?.slice(0, 1).map((qual, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">
                        {doctor.experience} years exp.
                      </span>
                      <Link
                        href={`/doctorList/${doctor.firstName.toLowerCase()}-${doctor.lastName.toLowerCase()}`}
                        className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/doctorList"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                View All Doctors
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive healthcare services designed to meet all your
              medical needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-br from-blue-300 via-blue-100 to-blue-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Quick Links
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              Navigate to important sections of our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/doctorList"
              className="bg-white p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 text-center"
            >
              <FaUserDoctor className="text-4xl text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Find Doctors
              </h3>
              <p className="text-gray-600 text-sm">
                Browse our directory of healthcare professionals
              </p>
            </Link>
            <Link
              href="/about"
              className="bg-white p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 text-center"
            >
              <FaHospital className="text-4xl text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">About Us</h3>
              <p className="text-gray-600 text-sm">
                Learn more about our mission and values
              </p>
            </Link>
            <Link
              href="/contact"
              className="bg-white p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 text-center"
            >
              <FaPhoneAlt className="text-4xl text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600 text-sm">
                Get in touch with our support team
              </p>
            </Link>
            <Link
              href="/feedback"
              className="bg-white p-6 rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 text-center"
            >
              <FaEnvelope className="text-4xl text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-600 text-sm">
                Share your experience with us
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-4 md:px-8 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Doctor?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Start your journey to better health today. Browse our extensive list
            of qualified doctors and book your appointment.
          </p>
          <Link
            href="/doctorList"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
