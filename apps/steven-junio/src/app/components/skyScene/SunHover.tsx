import React, { useState, useEffect } from "react";

export default function SunHover() {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles" })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Los_Angeles",
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute  bg-white shadow-lg rounded-lg z-50 p-2">
      <div className="text-nowrap text-lg">San Jose, CA</div>
      <div className="block px-4  whitespace-nowrap text-sm text-gray-700 font-semibold  rounded-t-lg  ">
        {currentTime}
      </div>
    </div>
  );
}
