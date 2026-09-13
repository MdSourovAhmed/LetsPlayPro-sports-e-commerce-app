import React from "react";
import Title from "../components/Title";
import NewletterBox from "../components/NewsLatterBox";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center mt-8 border-t">
        <Title t1={"ABOUT"} t2={"US"} />
      </div>
      <div className="my-10 flex flex-col md:flex-row gap-16">
        <img src="" className="w-full md:max-w-[480px]" alt="About Us" />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita,
            eius molestias necessitatibus eum beatae quidem facilis dolorum
            provident! Molestias, ullam? Nesciunt possimus mollitia nemo!
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vero sunt
            ratione quam deleniti.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            Our mission is to empower customers with choice, convenience and
            availability.
          </p>
        </div>
      </div>
      <div className="text-4xl py-4">
        <Title t1={"WHY"} t2={"CHOOSE US"} />
      </div>
      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex-col gap-5">
          <b>Quality Assurance:</b>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores
            sequi magni saepe eum quae vitae?
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex-col gap-5">
          <b>Convenience:</b>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores
            sequi magni saepe eum quae vitae?
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex-col gap-5">
          <b>Exceptional Customer Service:</b>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores
            sequi magni saepe eum quae vitae?
          </p>
        </div>
      </div>
      <NewletterBox/>
    </div>
  );
};

export default About;
