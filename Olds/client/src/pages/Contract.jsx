import React from 'react'
import Title from '../components/Title'
import NewsLatterBox from '../components/NewsLatterBox'
import location from '../assets/loc.jpg';

const Contract = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t border-gray-400'>
        <Title t1={'CONTRACT'} t2={'US'} />
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 '>
        <img src={location} className='w-full md:max-w-[480px] ' alt="Location" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className='text-gray-500'>Sabur Khan Market (3rd Floor) <br/> Tangail Sadar</p>
          <p className='text-gray-500'>Phone: +8801764-927457 <br/> Email: contract@letsplaypro.com </p>
          <p className='text-gray-600 font-semibold text-xl'>Carrer at LetsPlayPro</p>
          <p className='text-gray-500'>Learn more about us.</p>
          <button className='border border-black cursor-pointer px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500' >Explore Us</button>
        </div>
      </div>
      <NewsLatterBox/>
    </div>
  )
}

export default Contract



// import React from "react";
// import Title from "../components/Title";
// import NewsLatterBox from "../components/NewsLatterBox";

// const Contract = () => {
//   const openGoogleMaps = () => {
//     const url = `https://www.google.com/maps/place/Tangail,+Bangladesh/@24.2517,89.9167,15z`;
//     window.open(url, "_blank");
//   };

//   const getDirections = () => {
//     const url = `https://www.google.com/maps/dir//Sabur+Khan+Market+Tangail+Bangladesh/@24.2517,89.9167,15z`;
//     window.open(url, "_blank");
//   };

//   return (
//     <div>
//       <div className="text-center text-2xl pt-10 border-t border-gray-400">
//         <Title t1={"CONTRACT"} t2={"US"} />
//       </div>

//       <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
//         {/* Location Image/Map Placeholder */}
//         <div
//           className="w-full md:max-w-[480px] h-80 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
//           onClick={openGoogleMaps}
//         >
//           <div className="text-center">
//             <svg
//               className="w-20 h-20 text-gray-400 mx-auto mb-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1}
//                 d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
//               />
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={1}
//                 d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//               />
//             </svg>
//             <p className="text-gray-600 font-medium">
//               Click to view location on Google Maps
//             </p>
//             <p className="text-gray-500 text-sm mt-2">
//               Sabur Khan Market, Tangail
//             </p>
//           </div>
//         </div>

//         {/* Contact Information */}
//         <div className="flex flex-col justify-center items-start gap-6">
//           <p className="font-semibold text-xl text-gray-600">Our Store</p>
//           <p className="text-gray-500">
//             Sabur Khan Market (3rd Floor) <br />
//             Tangail Sadar, Bangladesh
//           </p>
//           <p className="text-gray-500">
//             Phone: +8801764-927457 <br />
//             Email: contract@letsplaypro.com
//           </p>

//           <p className="text-gray-600 font-semibold text-xl">
//             Career at LetsPlayPro
//           </p>
//           <p className="text-gray-500">Learn more about us.</p>

//           <div className="flex gap-4 flex-wrap">
//             <button
//               className="border border-black cursor-pointer px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500"
//               onClick={openGoogleMaps}
//             >
//               View Location
//             </button>

//             <button
//               className="border border-blue-500 text-blue-500 cursor-pointer px-8 py-4 text-sm hover:bg-blue-500 hover:text-white transition-all duration-500"
//               onClick={getDirections}
//             >
//               Get Directions
//             </button>
//           </div>
//         </div>
//       </div>

//       <NewsLatterBox />
//     </div>
//   );
// };

// export default Contract;
