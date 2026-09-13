// import React from "react";
// import logo from "../assets/logo.png";

// const Footer = () => {
//   return (
//     <div className="flex justify-center flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm ">
//       <div>
//         <img src={logo} className="mb-5 w-32" alt="" />
//         <p className="w-full md:w-2/3 text-gray-600">
//           Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium
//           perferendis dolores aperiam sit voluptatem. Aliquid esse voluptates
//           magni voluptas quis dicta laboriosam voluptatem architecto quo.
//         </p>
//       </div>

//       <div>
//         <p className="text-xl font-medium mb-5">COMPANY</p>
//         <ul className="flex flex-col gap-1 text-gray-600 ">
//           <li>Home</li>
//           <li>About Us</li>
//           <li>Delivery</li>
//           <li>Privacy Policy</li>
//         </ul>
//       </div>

//       <div>
//         <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
//         <ul className="flex flex-col gap-1 text-gray-600 ">
//           <li>+88-01723-479072</li>
//           <li>contract@letsplaypro.com</li>
//         </ul>
//       </div>

//       <div>
//         <hr />
//         <p className="py-5 text-sm text-center ">
//           Copyright 2025@ letsplaypro.com - All Right Reserved.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Footer;

import React from "react";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div className="">
          <img src={logo} className="mb-5 w-32" alt="Let's Play Pro Logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Laudantium
            perferendis dolores aperiam sit voluptatem. Aliquid esse voluptates
            magni voluptas quis dicta laboriosam voluptatem architecto quo.
          </p>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+88-01723-479072</li>
            <li>contract@letsplaypro.com</li>
          </ul>
        </div>

        <div className="sm:col-span-3">
          <hr />
          <p className="py-5 text-sm text-center">
            Copyright © 2025 Let's Play Pro. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
