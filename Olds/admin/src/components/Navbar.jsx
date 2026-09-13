import React from 'react'
import { useNavigate } from "react-router-dom";
import logo from '../assets/LetsPlayPro.png';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className='flex items-center py-2 px-[4%] justify-between '>
        <img src={logo} className='w-[max(8%,80px)] ' alt="" />
      <button onClick={() => navigate("/signup")} className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'>Log In</button>
    </div>
  )
}

export default Navbar ;


// import React from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Navbar = () => {
//   const navigate = useNavigate();

//   return (
//     <nav className="flex items-center justify-between py-3 px-[4%] bg-white shadow-sm sticky top-0 z-50">
//       {/* Left: Logo */}
//       <div
//         className="flex items-center gap-2 cursor-pointer"
//         onClick={() => navigate("/")}
//       >
//         <img
//           src="/logo.png"
//           alt="Logo"
//           className="w-[max(10%,80px)] h-auto object-contain"
//         />
//         <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
//           MyBrand
//         </h1>
//       </div>

//       {/* Center: Navigation Links */}
//       <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
//         <Link
//           to="/"
//           className="hover:text-blue-600 transition-colors duration-200"
//         >
//           Home
//         </Link>
//         <Link
//           to="/about"
//           className="hover:text-blue-600 transition-colors duration-200"
//         >
//           About
//         </Link>
//         <Link
//           to="/services"
//           className="hover:text-blue-600 transition-colors duration-200"
//         >
//           Services
//         </Link>
//         <Link
//           to="/contact"
//           className="hover:text-blue-600 transition-colors duration-200"
//         >
//           Contact
//         </Link>
//       </div>

//       {/* Right: Auth Buttons */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => navigate("/login")}
//           className="border border-gray-500 text-gray-700 px-5 py-2 rounded-full text-sm hover:bg-gray-100 transition"
//         >
//           Sign In
//         </button>
//         <button
//           onClick={() => navigate("/signup")}
//           className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition"
//         >
//           Sign Up
//         </button>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
