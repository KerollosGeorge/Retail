// components/Footer.jsx
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 pt-12 pb-6 w-full">
      <div className="max-w-6xl mx-auto px-4 grid gap-10 md:grid-cols-4 sm:grid-cols-2">
        {/* Brand / About */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Negmet Heliopolis
          </h2>
          <p className="text-sm text-gray-400">
            Your one-stop destination for quality products, unbeatable prices,
            and quick delivery.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="/#categories" className="hover:text-white transition">
                Categories
              </a>
            </li>
            <li>
              <a href="/#discounts" className="hover:text-white transition">
                Discounts
              </a>
            </li>
            <li>
              <a href="/#branches" className="hover:text-white transition">
                Our Branches
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Contact Us</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-1" />
              123 Market Street, NY, USA
            </li>
            <li className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              (123) 456-7890
            </li>
            <li className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              support@shopease.com
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex space-x-4 mt-2">
            <a href="#" className="hover:text-blue-500 transition">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-pink-500 transition">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-sky-400 transition">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Negmet Heliopolis. All rights
        reserved.
      </div>
    </footer>
  );
};
