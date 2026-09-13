import React, { useState, useEffect } from "react";
import Title from "./Title.jsx";
import ProductItem from "./ProductItem.jsx";
import api from "../utils/api.js"; 

const BestSeller = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBestSellers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/bestsellers", {
        params: {
          page,
          limit: 10,
          bestSell: true, // Or 'high-low' for top sellers by price/sales if tracked
        },
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch best sellers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBestSellers(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading)
    return <div className="text-center py-8">Loading best sellers...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8 ">
        <Title t1={"BEST"} t2={"SELLER"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 ">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ratione
          omnis, sint fugit facilis rem quia.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {products.map((item) => (
          <ProductItem
            key={item._id || item.sku}
            id={item._id || item.sku}
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

export default BestSeller;
