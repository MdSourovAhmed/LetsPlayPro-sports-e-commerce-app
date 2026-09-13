// import React, { createContext, useState, useMemo } from "react";
// // import products from '../assets/products'

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   const [user, setUser] = useState(null); // null for unauthenticated, or { id, name, email } after login
//   const [cartItems, setCartItems] = useState({});
//   const [searchQuery, setSearchQuery] = useState("");
//   const [search,setSearch]=useState('');
//   const [showSearch,setShowSearch]=useState(false);

//   // Computed cart count
//   const cartCount = useMemo(() => {
//     return Object.values(cartItems).reduce((total, count) => total + count, 0);
//   }, [cartItems]);

//   // Auth functions
//   const login = (userData) => {
//     setUser(userData);
//     // Optionally store in localStorage: localStorage.setItem('user', JSON.stringify(userData));
//   };

//   const logout = () => {
//     setUser(null);
//     // localStorage.removeItem('user');
//   };

//   // Cart functions (basic)
//   const addToCart = (itemId) => {
//     setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
//   };

//   const removeFromCart = (itemId) => {
//     setCartItems((prev) => ({
//       ...prev,
//       [itemId]: Math.max(0, (prev[itemId] || 0) - 1),
//     }));
//   };

//   const updateCartItemCount = (itemId, newCount) => {
//     setCartItems((prev) => ({ ...prev, [itemId]: newCount }));
//   };

//   const getTotalCartAmount = () => {
//     // Implement based on products data
//     return 0;
//   };

//   const values = {
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     user,
//     login,
//     logout,
//     cartItems,
//     addToCart,
//     removeFromCart,
//     updateCartItemCount,
//     getTotalCartAmount,
//     cartCount,
//     searchQuery,
//     setSearchQuery,
//   };

//   return (
//     <ShopContext.Provider value={values}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;

// import React, { createContext, useState, useMemo, useEffect } from "react";
// import api from "../utils/api";

// export const ShopContext = createContext();

// const ShopContextProvider = (props) => {
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [user, setUser] = useState(null);
//   const [cartItems, setCartItems] = useState({});
//   const [searchQuery, setSearchQuery] = useState("");
//   const [search, setSearch] = useState("");
//   const [showSearch, setShowSearch] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       // console.log(token);
//       api
//         .get("/auth/me")
//         .then((res) => setUser(res.data.user))
//         .catch(() => localStorage.removeItem("token"))
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async ({ email, password }) => {
//     const res = await api.post("/login", { email, password });
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const signup = async ({ name, email, password, role }) => {
//     // console.log(name);
//     const res = await api.post("/signup", { name, email, password, role });
//     console.log(res);
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   // Calculate total number of items in the cart
//   const cartCount = useMemo(() => {
//     return Object.values(cartItems).reduce(
//       (total, item) => total + (item.quantity || 0),
//       0
//     );
//   }, [cartItems]);

//   // --- Cart functions ---
//   const addToCart = (product, selectedSize) => {
//     if (!product || !product._id) return;

//     setCartItems((prev) => {
//       const existing = prev[product._id];

//       // If product exists in cart
//       if (existing) {
//         return {
//           ...prev,
//           // [product._id]: {
//           [product._id]: {
//             ...existing,
//             quantity: existing.quantity + 1,
//             selectedSize, // update if changed
//           },
//         };
//       }

//       // If product is new
//       return {
//         ...prev,
//         [product._id]: {
//           product: {
//             _id: product._id,
//             name: product.name,
//             image: product.image || product.images?.[0],
//             price: product.price,
//             brand: product.brand,
//           },
//           selectedSize,
//           quantity: 1,
//         },
//       };
//     });
//     console.log("cartItems: ", cartItems);
//   };

//   const removeFromCart = (productId, toDelete = false) => {
//     setCartItems((prev) => {
//       const updated = { ...prev };
//       if (updated[productId] && toDelete) {
//         return delete updated[productId];
//       }

//       if (updated[productId]) {
//         if (updated[productId].quantity > 1) {
//           updated[productId].quantity -= 1;
//         } else {
//           delete updated[productId];
//         }
//       }
//       return updated;
//     });
//   };

//   const updateCartItemCount = (productId, newCount) => {
//     setCartItems((prev) => ({
//       ...prev,
//       [productId]: {
//         ...prev[productId],
//         quantity: newCount,
//       },
//     }));
//   };

//   const getTotalCartAmount = () => {
//     return Object.values(cartItems).reduce(
//       (total, item) => total + item.product.price * item.quantity,
//       0
//     );
//   };

//   const values = {
//     searchResults,
//     setSearchResults,
//     search,
//     setSearch,
//     showSearch,
//     setShowSearch,
//     setUser,
//     user,
//     signup,
//     login,
//     logout,
//     cartItems,
//     addToCart,
//     removeFromCart,
//     updateCartItemCount,
//     getTotalCartAmount,
//     cartCount,
//     searchQuery,
//     setSearchQuery,
//   };

//   return (
//     <ShopContext.Provider value={values}>{props.children}</ShopContext.Provider>
//   );
// };

// export default ShopContextProvider;





import React, { createContext, useState, useMemo, useEffect } from "react";
import api from "../utils/api";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ✅ Load current user if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setLoading(false);

      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Load cart from localStorage on mount
useEffect(() => {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) {
    try {
      setCartItems(JSON.parse(savedCart));
    } catch (err) {
      console.error("Error parsing saved cart:", err);
      localStorage.removeItem("cartItems");
    }
  }
}, []);

// ✅ Save cart whenever it changes
useEffect(() => {
  if (Object.keys(cartItems).length > 0) {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  } else {
    localStorage.removeItem("cartItems");
  }
}, [cartItems]);


  // ✅ Authentication
  const login = async (credentials) => {
    const res = await api.post("/login", credentials);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const signup = async (info) => {
    const res = await api.post("/signup", info);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ✅ Memoized cart count
  const cartCount = useMemo(
    () => Object.values(cartItems).reduce((t, i) => t + (i.quantity || 0), 0),
    [cartItems]
  );

  // ✅ Add product to cart
  const addToCart = (product, selectedSize) => {
    if (!product?._id) return;
    setCartItems((prev) => {
      const existing = prev[product._id];
      const updatedItem = existing
        ? { ...existing, quantity: existing.quantity + 1, selectedSize }
        : {
            product: {
              _id: product._id,
              name: product.name,
              image: product.image || product.images?.[0],
              price: product.price,
              brand: product.brand,
            },
            selectedSize,
            quantity: 1,
          };
      return { ...prev, [product._id]: updatedItem };
    });
  };

  // ✅ Remove or decrement product
  const removeFromCart = (productId, toDelete = false) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (!updated[productId]) return prev;

      if (toDelete || updated[productId].quantity <= 1) {
        delete updated[productId];
      } else {
        updated[productId] = {
          ...updated[productId],
          quantity: updated[productId].quantity - 1,
        };
      }
      return updated;
    });
  };

  // ✅ Update quantity manually
  const updateCartItemCount = (productId, newCount) => {
    if (newCount < 1) return removeFromCart(productId, true);
    setCartItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: newCount,
      },
    }));
  };

  const clearCart=()=>{
    setCartItems({});
  }

  // ✅ Get total price
  // const getTotalCartAmount = useMemo(
  //   () =>
  //     Object.values(cartItems).reduce(
  //       (t, i) => t + i.product.price * i.quantity,
  //       0
  //     ),
  //   [cartItems]
  // );


  const getTotalCartAmount = () => {
    return Object.values(cartItems).reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const values = {
    loading,
    user,
    setUser,
    login,
    signup,
    logout,
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItemCount,
    clearCart,
    getTotalCartAmount,
    cartCount,
    searchResults,
    setSearchResults,
    search,
    setSearch,
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
  };

  return (
    <ShopContext.Provider value={values}>
      {!loading && children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
