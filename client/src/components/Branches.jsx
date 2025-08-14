// components/OurBranches.jsx
import { MapPin, Phone, Clock, Map } from "lucide-react";

const branches = [
  {
    name: "Downtown Branch",
    address: "123 Main St, Downtown, NY",
    phone: "(123) 456-7890",
    hours: "24/7",
    mapLink: "https://www.google.com/maps?q=123+Main+St+Downtown+NY",
    image:
      "https://images.unsplash.com/photo-1580618672591-8ff3f1b14e3d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Uptown Branch",
    address: "456 Central Ave, Uptown, NY",
    phone: "(987) 654-3210",
    hours: "24/7",
    mapLink: "https://www.google.com/maps?q=456+Central+Ave+Uptown+NY",
    image:
      "https://images.unsplash.com/photo-1567899378494-45c7fcd0db30?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Westside Branch",
    address: "789 Sunset Blvd, Westside, CA",
    phone: "(555) 123-4567",
    hours: "24/7",
    mapLink: "https://www.google.com/maps?q=789+Sunset+Blvd+Westside+CA",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
  },
  // Add more branches with images if needed
];

export const OurBranches = () => {
  return (
    <section className="py-12" id="branches">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-10">Our Branches 🏬</h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-200 overflow-hidden"
            >
              <img
                src={branch.image}
                alt={branch.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-6">
                <h3 className="text-2xl font-semibold text-blue-700 mb-3">
                  {branch.name}
                </h3>

                <div className="space-y-2 text-gray-700 text-sm">
                  <p className="flex items-start">
                    <MapPin className="w-5 h-5 mt-1 mr-2 text-blue-500" />
                    {branch.address}
                  </p>
                  <p className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-green-600" />
                    {branch.phone}
                  </p>
                  <p className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                    {branch.hours}
                  </p>
                </div>

                <a
                  href={branch.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition duration-200"
                >
                  <Map className="w-4 h-4" />
                  View on Map
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
