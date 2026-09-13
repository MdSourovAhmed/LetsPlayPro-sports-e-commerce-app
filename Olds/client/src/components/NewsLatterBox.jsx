import React from "react";

const NewsLatterBox = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target.value);
  };
  
  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-500 ">
        Subscribe now & get 20% Off.
      </p>
      <p className="text-gray-400 mt-3 ">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Similique,
        inventore.
      </p>
      <form
        onSubmit={handleSubmit}
        action=""
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3 "
      >
        <input
          className="w-full sm:flex-1 outline-none"
          type="email"
          placeholder="Enter Your E-mail"
        />
        <button
          className="bg-black text-white text-xs px-10 py-4 "
          type="sunmit"
        >
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsLatterBox;
