import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Linkedin,
  BookOpen,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Logo & About */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="text-orange-500 w-7 h-7" />
            <span className="text-2xl font-bold text-orange-500">
              FinSaarthi
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Empowering students by bridging the gap between academic excellence
            and financial support. Explore scholarships, apply, and achieve your dreams.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-orange-400">Home</Link></li>
            <li><Link to="/scholarships" className="hover:text-orange-400">Scholarships</Link></li>
            <li><Link to="/dashboard" className="hover:text-orange-400">Dashboard</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Us
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-orange-400" />
              <span>support@finsaarthi.com</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-orange-400" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span>New Delhi, India</span>
            </li>
          </ul>
        </div>

        {/* Social / Repo */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Connect With Us
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center space-x-2">
              <Github className="w-5 h-5 text-orange-400" />
              <a
                href="https://github.com/shubhamanand020/Finsaarthi.git"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400"
              >
                GitHub Repository
              </a>
            </li>
            <li className="flex items-center space-x-2">
              <Linkedin className="w-5 h-5 text-orange-400" />
              <a
                href="https://linkedin.com/in/your-profile"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400"
              >
                LinkedIn Profile
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t border-gray-700 pt-5 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} FinSaarthi — All Rights Reserved.
      </div>
    </footer>
  );
};