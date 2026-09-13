// import React, { useEffect } from "react";
// import Title from "./Title";
// import ProductItem from "./ProductItem";

// import sportsData from "../assets/sportsData.js";

// const LatestCollections = () => {
//   //   useEffect(() => {}, []);
//   const Products = sportsData.slice(0, 10);
//   //   console.log(Products);
//   return (
//     <div className="my-10 ">
//       <div className="text-center py-8 text-3xl">
//         <Title t1={"LATEST"} t2={"COLLECTIONS"} />
//         <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base test-gray-600 ">
//           Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa aut
//           vitae suscipit recusandae omnis, minima quisquam esse cum tenetur
//           commodi.
//         </p>
//       </div>
//       <div className="grid grid-col-2 sm:grid-col-3 md:grid-cols-4 lg:grid-col-5 gap-4 gap-y-6">
//         {Products.map((item, index) => {
//           <ProductItem
//             id={index}
//             image={item.imageUrl}
//             name={item.name}
//             price={Products[0].price}
//           />;
//         })}
//       </div>
//     </div>
//   );
// };

// export default LatestCollections;



import React, { useState, useEffect } from "react";
import Title from "./Title";
import ProductItem from "./ProductItem";
import api from "../utils/api.js"; 

const LatestCollections = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLatest = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/latest", {
        params: {
          page,
          limit: 10, // 10 per page for "latest collections"
          sort: "relevant", // Newest first
        },
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch latest collections"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading)
    return (
      <div className="text-center py-8">Loading latest collections...</div>
    );
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title t1={"LATEST"} t2={"COLLECTIONS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa aut
          vitae suscipit recusandae omnis, minima quisquam esse cum tenetur
          commodi.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {products.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            image={item.images?.[0]}
            name={item.name}
            price={item.price}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            // className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            className={`px-3 py-1 border rounded-md ${
        currentPage === 1
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-600 hover:bg-gray-100"
      } cursor-pointer`}
          >
            ← Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded-md border ${
                currentPage === i + 1
                  ? "bg-gray-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              } cursor-pointer`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            // className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
            className={`px-3 py-1 border rounded-md ${
        currentPage === totalPages
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-600 hover:bg-gray-100"
      } cursor-pointer`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestCollections;
