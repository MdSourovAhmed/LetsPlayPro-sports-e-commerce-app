// import React from "react";
// import { Link } from "react-router-dom";

// const ProductItem = ({ id, image, name, price }) => {
//   console.log(image);
//   return (
//     <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
//       <div className="overflow-hidden">
//         <img
//           src={image}
//           className="hover:scale-110 transition ease-in-out"
//           alt=""
//         />
//       </div>
//       <p className="pt-3 pb-1 text-sm ">{name?name:''}</p>
//       <p className="font-medium text-sm ">{price}$</p>
//     </Link>
//   );
// };

// export default ProductItem;

import React from "react";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  return (
    <Link
      className="text-gray-700 cursor-pointer block hover:shadow-md transition"
      to={`/product/${id}`}
    >
      <div className="overflow-hidden rounded-lg">
        <img
          src={image}
          className="hover:scale-110 transition-transform ease-in-out duration-300 w-full h-48 object-cover"
          alt={name || "Product"}
        />
      </div>
      <p className="pt-3 pb-1 text-sm font-medium truncate">{name || "Unnamed Product"}</p>
      <p className="font-semibold text-sm">{price}$</p>
    </Link>
  );
};

export default ProductItem;
