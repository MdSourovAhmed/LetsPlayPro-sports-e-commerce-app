import React from "react";
import Title from "./Title";
import exchange from "../assets/exchange.png";
import delivery from "../assets/return.png";
import customer_service from "../assets/customer_service.png";

const OurPolicy = () => {
  return (
    <div className="text-center text-3xl py-8 ">
      <Title t1={"OUR"} t2={"POLICY"} />
      <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700 ">
        <div>
          <img src={exchange} className="w-12 m-auto mb-5" alt="" />
          <p className="font-semibold">Easy Exchange Policy</p>
          <p className="text-gray-400 ">We Offer Hassle free Exchange Policy</p>
        </div>
        <div>
          <img src={delivery} className="w-12 m-auto mb-5" alt="" />
          <p className="font-semibold">7 Days Return Policy</p>
          <p className="text-gray-400 ">We Provide & Days Free Return Policy</p>
        </div>
        <div>
          <img src={customer_service} className="w-12 m-auto mb-5" alt="" />
          <p className="font-semibold">Best Customer Support</p>
          <p className="text-gray-400 ">We Offer 24/7 customer support</p>
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;
