import React from "react";

import newArrival from '../assets/NewArrivals1.jpg'

const Hero = () => {
  return (
    <div className="flex flex-col sm:flex-row border border-gray-400 ">
      <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0">
        <div className="text-[#414141]">
          <div className="flex items-center gap-2 ">
            <p className="w-8 md:w-11 h-[2px] bg-[#414141] "></p>
            <p className="font-medium text-sm md:text-base">OUR BEST SELLERS</p>
          </div>
          <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed ">
            Latest Arrivals
          </h1>
          <div className="flex items-center gap-2 ">
            <p className="font-medium text-sm md:text-base">SHOP NOW</p>
            <p className="w-8 md:w-11 h-[2px] bg-[#414141] "></p>
          </div>
        </div>
      </div><img src={newArrival} alt="" className="w-full max-h-[540px] sm:w-1/2" />
    </div>
  );
};

export default Hero;

// import React, { useState, useEffect } from "react";
// import Images from "../assets/LatestProducts.js"; // Assuming this exports { images: [...] }
// import newArrival from "../assets/NewArrivals1.jpg"; // Fallback image

// const Hero = () => {
//   const Srcs = [
//     "../assets/NewArrivals1.jpg",
//     "../assets/NewArrivals2.jpg",
//     "../assets/NewArrivals3.jpg",
//   ];
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const images = Srcs || [newArrival]; // Use array from file, fallback to single

//   return (
//     <div className="flex flex-col sm:flex-row border border-gray-400 relative overflow-hidden">
//       <div className="w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0 z-10">
//         <div className="text-[#414141]">
//           <div className="flex items-center gap-2">
//             <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
//             <p className="font-medium text-sm md:text-base">OUR BEST SELLERS</p>
//           </div>
//           <h1 className="prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed">
//             Latest Arrivals
//           </h1>
//           <div className="flex items-center gap-2">
//             <p className="font-medium text-sm md:text-base">SHOP NOW</p>
//             <p className="w-8 md:w-11 h-[2px] bg-[#414141]"></p>
//           </div>
//         </div>
//       </div>
//       <div className="w-full sm:w-1/2 relative">
//         {images.map((_, indx) => (
//           <img
//             src={images[indx]}
//             alt={`Latest Arrival ${currentImageIndex + 1}`}
//             className="w-full max-h-[540px] object-cover transition-opacity duration-1000 opacity-100 absolute inset-0"
//             style={{ opacity: 1 }}
//           />
//         ))}
//         {/* Optional: Dots indicator */}
//         {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
//           {images.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentImageIndex(index)}
//               className={`w-3 h-3 rounded-full transition-all duration-300 ${
//                 index === currentImageIndex
//                   ? "bg-white scale-125"
//                   : "bg-white/50"
//               }`}
//             />
//           ))}
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default Hero;
