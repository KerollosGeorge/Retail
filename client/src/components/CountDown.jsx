import { useEffect, useState } from "react";

export const CountDown = ({ date }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(date) - new Date();
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [date]);

  return (
    <div className="flex gap-1 items-center justify-center mt-4">
      <div className="countdown-item bg-gradient-to-r from-red-500 to-pink-500 w-[100px] p-1 rounded-xl shadow-lg text-white text-lg flex flex-col items-center">
        <span className="text-4xl font-semibold">{timeLeft.days}</span>
        <span className="text-xs">Days</span>
      </div>
      <div className="countdown-item bg-gradient-to-r from-yellow-500 to-orange-500 w-[100px] p-1 rounded-xl shadow-lg text-white text-lg flex flex-col items-center">
        <span className="text-4xl font-semibold">{timeLeft.hours}</span>
        <span className="text-xs">Hours</span>
      </div>
      <div className="countdown-item bg-gradient-to-r from-green-500 to-teal-500 w-[100px] p-1 rounded-xl shadow-lg text-white text-lg flex flex-col items-center">
        <span className="text-4xl font-semibold">{timeLeft.minutes}</span>
        <span className="text-xs">Minutes</span>
      </div>
      <div className="countdown-item bg-gradient-to-r from-blue-500 to-indigo-500 w-[100px] p-1 rounded-xl shadow-lg text-white text-lg flex flex-col items-center">
        <span className="text-4xl font-semibold">{timeLeft.seconds}</span>
        <span className="text-xs">Seconds</span>
      </div>
    </div>
  );
};
