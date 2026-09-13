import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../contexts/ShopContext";
import searchIcon from "../assets/search.png";
import closeIcon from "../assets/close.png";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } =
    useContext(ShopContext);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const pageLocation = useLocation();

  // Only show search bar in "collection" route
  useEffect(() => {
    setVisible(pageLocation.pathname.includes("collection"));
  }, [pageLocation]);

  // Debounce to prevent excessive API calls
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setDropdownVisible(false);
      return;
    }

    const delay = setTimeout(() => {
      handleSearch(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/search", {
        params: { q: query.trim(), limit: 5 },
      });
      const products = res.data.products || [];
      setResults(products);
      setDropdownVisible(products.length > 0);
    } catch (err) {
      console.error("Search error:", err);
      setError("Something went wrong. Try again.");
      setDropdownVisible(false);
    } finally {
      setLoading(false);
    }
  };

  return showSearch && visible ? (
    <div className="border-t border-gray-400 bg-gray-50 text-center relative">
      <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          className="flex-1 outline-none bg-inherit text-sm"
          placeholder="Search products..."
        />
        {loading ? (
          <div className="loader w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <img src={searchIcon} className="w-4" alt="Search" />
        )}
      </div>

      <img
        onClick={() => setShowSearch(false)}
        src={closeIcon}
        alt="Close"
        className="inline w-4 cursor-pointer"
      />

      {/* Search Results Dropdown */}
      {dropdownVisible && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bg-white shadow-lg border border-gray-300 rounded-md w-3/4 sm:w-1/2 max-h-64 overflow-y-auto z-50">
          {results.map((p) => (
            <div
              key={p._id}
              className="flex gap-4 items-center p-2 text-left hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                // window.location.href = `/product/${p._id}`;
                navigate(`/product/${p._id}`);
              }}
            >
              <img src={p.images?p.images[0]:''} className="w-7" alt="" />
              <div className="font-semibold text-sm">{p.name}</div>
              <div className="text-xs text-gray-500">{p.category}</div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  ) : null;
};

export default SearchBar;



// const SearchBar = () => {
//   const { search, setSearch, showSearch, setShowSearch } =
//     useContext(ShopContext);
//   const [visible, setVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//     const [dropdownVisible, setDropdownVisible] = useState(false);
//     const [results, setResults] = useState([]);
//   const [error, setError] = useState("");
//   const pageLocation = useLocation();

//   useEffect(() => {
//     if (pageLocation.pathname.includes("collection")) {
//       setVisible(true);
//     } else {
//       setVisible(false);
//     }
//   }, [pageLocation]);

//   const handleSearch = async (query) => {
//     try {
//       setLoading(true);
//       setError("");
//       console.log(query.trim());
//       const res = await api.get("/search", {
//         params: { q: query, limit: 5 },
//       });
//       const products = res.data.products || [];
//       setResults(products);
//       setSearchResults?.(products);
//       setDropdownVisible(products.length > 0);
//     } catch (err) {
//       console.error("Search error:", err);
//       setError("Something went wrong. Try again.");
//       setDropdownVisible(false);
//     }
//   };

//   useEffect(() => {
//     console.log("Searching: ", search);
//     handleSearch(search);
//   }, [search]);

//   return showSearch && visible ? (
//     <div className=" border-t border-gray-400 bg-gray-50 text-center ">
//       <div className="inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           type="text"
//           className="flex-1 outline-none bg-inherit text-sm"
//           placeholder="Search"
//         />
//         <img src={search_bar} className="w-4" alt="" />
//       </div>
//       <img
//         onClick={() => setShowSearch(false)}
//         src={close}
//         alt=""
//         className="inline w-4 cursor-pointer"
//       />
//     </div>
//   ) : null;
// };

// export default SearchBar;
