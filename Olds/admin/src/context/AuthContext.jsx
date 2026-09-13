// import React, { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();
// const AuthContext = ({ children }) => {
//   //   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   // ✅ Load current user if token exists
//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) return setLoading(false);

//       try {
//         const res = await api.get("/auth/admin");
//         setUser(res.data.user);
//       } catch {
//         localStorage.removeItem("token");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUser();
//   }, []);

//   // ✅ Authentication
//   const login = async (credentials) => {
//     const res = await api.post("/login", credentials);
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const signup = async (info) => {
//     const res = await api.post("/signup", info);
//     localStorage.setItem("token", res.data.token);
//     setUser(res.data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };
//   return (
//     <AuthContext.Provider value={values}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;



import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api"; // ✅ IMPORTANT

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Load current user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/admin");
        setUser(res.data.user);
      } catch (err) {
        console.error("Auth load failed:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login
  const login = async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Signup
  const signup = async (info) => {
    const res = await api.post("/auth/signup", info);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const values = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={values}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
