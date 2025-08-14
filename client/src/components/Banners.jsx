import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Banners = () => {
  const images = [
    "/Banners/1.png",
    "/Banners/2.jpg",
    "/Banners/3.jpg",
    "/Banners/4.jpg",
    "/Banners/5.jpg",
    "/Banners/6.jpg",
  ];

  const [imageIndex, setImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setImageIndex(index);
  };

  return (
    <div className="relative w-full h-[350px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl group">
      {/* Slides */}
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${imageIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index}`}
            className={`w-full h-[350px] md:h-[600px] flex-shrink-0 object-cover transition-transform duration-1000 ${
              imageIndex === index ? "scale-105" : "scale-100"
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/fallback.jpg";
            }}
          />
        ))}
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/30 to-transparent z-10" />

      {/* Slide text */}
      <div className="absolute top-1/2 left-6 md:left-16 transform -translate-y-1/2 z-20 text-white space-y-4 max-w-[90%] md:max-w-[40%]">
        <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight drop-shadow-xl animate-fade-in-up">
          Discover Quality at{" "}
          <span className="text-[#0098b3]">
            Negmet Heliopolis (Gamal Salama)
          </span>
        </h2>
        <p className="text-sm md:text-lg text-white/90 font-light animate-fade-in-up delay-200">
          From electronics to fashion — enjoy exclusive deals and top-rated
          products.
        </p>
        <button
          className="mt-4 px-6 py-3 bg-[#0098b3] text-slate-200 font-semibold rounded-full hover:bg-[#36b0c6] transition animate-fade-in-up delay-300 shadow-md"
          onClick={() => navigate("/products")}
        >
          Shop Now
        </button>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-4 h-4 rounded-full border transition-all duration-300 ${
              imageIndex === idx
                ? "bg-[#0098b3] border-[#256c79] scale-110 shadow-md"
                : "bg-white/50 border-white hover:bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
