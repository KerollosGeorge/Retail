import React from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const AboutUs = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Navbar />
      <div className="flex flex-col gap-4 w-[60%] ">
        <h1 className="text-4xl font-semibold text-center">About Us</h1>
        <p>
          Negmet Heliopolis (Gamal Salama) was established 1958 with 1 branch in
          Heliopolis, specialized in wholesale market and distribution of FMCG
        </p>
        <p>
          Negmet Heliopolis grew over the years, we are currently running 8
          branches to cover different regions in Cairo
        </p>
        <p>
          We enjoy different types of clientele, expanding over time with the
          ongoing economy fluctuations
        </p>
        <p>
          along with our unbeatable pricing strategy, help us attract a wide
          range of audience, with various life standards.
        </p>
        <p>
          Our business ethics and integrity help us retain our old customers and
          expand our audience base over time
        </p>
      </div>
      <Footer />
    </div>
  );
};
