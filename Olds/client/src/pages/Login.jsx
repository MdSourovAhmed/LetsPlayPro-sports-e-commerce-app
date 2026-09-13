import React, { useContext, useState } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast"; 
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../contexts/ShopContext";

const Login = () => {
  const { login, signup, setUser, user } = useContext(ShopContext);
  const [currentState, setCurrentState] = useState("Sign Up");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.type === "text" ? "name" : e.target.type]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (currentState === "Sign Up") {
        response = await api.post("/signup", formData);
        // signup(formData);
        toast.success("Account created successfully!");
      } else {
        response = await api.post("/login", {
          email: formData.email,
          password: formData.password,
        });
        // login({ email: formData.email, password: formData.password });
        toast.success("Logged in successfully!");
      }

      localStorage.setItem("token", response.data.token);
      console.log("response: ", response.data);
      setUser(response.data.user);
      console.log("User: ", response.data.user);
      console.log("User: ",user);

      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-700"
      >
        <div className="inline-flex items-center gap-2 mb-2 mt-10">
          <p className="prata-regular text-3xl">{currentState}</p>
          <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
        </div>

        {currentState === "Sign Up" && (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-800"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}

        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="w-full flex justify-between text-sm mt-[-8px]">
          <p className="cursor-pointer">Forgot your Password?</p>
          {currentState === "Login" ? (
            <p
              className="cursor-pointer"
              onClick={() => setCurrentState("Sign Up")}
            >
              Create Account
            </p>
          ) : (
            <p
              className="cursor-pointer"
              onClick={() => setCurrentState("Login")}
            >
              Login Here
            </p>
          )}
        </div>

        <button
          disabled={loading}
          className="bg-black cursor-pointer text-white font-light px-8 py-2 mt-4 disabled:opacity-60"
        >
          {loading
            ? "Processing..."
            : currentState === "Login"
            ? "Log In"
            : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Login;




// import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { ShopContext } from "../contexts/ShopContext";
// import { toast } from "react-toastify"; // For notifications
// import api from "../utils/api.js";

// const Login = () => {
//   const [currentState, setCurrentState] = useState("Sign Up");
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [showForgotModal, setShowForgotModal] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState("");
//   const navigate = useNavigate();
//   const { login } = useContext(ShopContext);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.email || !formData.password) {
//       toast.error("Email and password are required");
//       return;
//     }
//     if (currentState === "Sign Up" && !formData.name) {
//       toast.error("Name is required for sign up");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     try {
//       let response;
//       if (currentState === "Sign Up") {
//         response = await api.post("/auth/signup", formData);
//         toast.success("Account created successfully!");
//       } else {
//         response = await api.post("/auth/login", {
//           email: formData.email,
//           password: formData.password,
//         });
//         toast.success("Login successful!");
//       }

//       const { token, user } = response.data;
//       localStorage.setItem("token", token);
//       login(user);

//       navigate("/");
//     } catch (err) {
//       const msg = err.response?.data?.message || "Login/Signup failed";
//       toast.error(msg);
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     if (!forgotEmail) {
//       toast.error("Email is required");
//       return;
//     }

//     try {
//       await api.post("/auth/forgot-password", { email: forgotEmail });
//       toast.success("Reset link sent to your email!");
//       setShowForgotModal(false);
//       setForgotEmail("");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to send reset link");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col items-center w-full max-w-md m-auto mt-14 gap-4 text-gray-700 bg-white p-8 rounded-lg shadow-md"
//         >
//           <div className="inline-flex items-center gap-2 mb-2 mt-10 w-full text-center">
//             <p className="prata-regular text-3xl w-full">{currentState}</p>
//             <hr className="border-none h-[1.5px] w-8 bg-gray-800 flex-1" />
//           </div>

//           {currentState === "Sign Up" && (
//             <input
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               type="text"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Name *"
//               required
//             />
//           )}
//           <input
//             name="email"
//             value={formData.email}
//             onChange={handleInputChange}
//             type="email"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Email *"
//             required
//           />
//           <input
//             name="password"
//             value={formData.password}
//             onChange={handleInputChange}
//             type="password"
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Password *"
//             required
//           />
//           {error && (
//             <p className="w-full text-red-500 text-sm text-center">{error}</p>
//           )}
//           <div className="w-full flex justify-between text-sm mt-[-8px]">
//             <p
//               className="cursor-pointer text-blue-500 hover:underline"
//               onClick={() => setShowForgotModal(true)}
//             >
//               Forgot your Password?
//             </p>
//             {currentState === "Login" ? (
//               <p
//                 className="cursor-pointer text-blue-500 hover:underline"
//                 onClick={() => setCurrentState("Sign Up")}
//               >
//                 Create Account
//               </p>
//             ) : (
//               <p
//                 className="cursor-pointer text-blue-500 hover:underline"
//                 onClick={() => setCurrentState("Login")}
//               >
//                 Login Here
//               </p>
//             )}
//           </div>
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-black cursor-pointer text-white font-light px-8 py-2 mt-4 w-full rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
//           >
//             {loading
//               ? "Processing..."
//               : currentState === "Login"
//               ? "Log In"
//               : "Sign Up"}
//           </button>
//         </form>
//       </div>

//       {/* Forgot Password Modal */}
//       {showForgotModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-md max-w-md w-full mx-4">
//             <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
//             <form onSubmit={handleForgotPassword}>
//               <input
//                 type="email"
//                 value={forgotEmail}
//                 onChange={(e) => setForgotEmail(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
//                 placeholder="Enter your email"
//                 required
//               />
//               <div className="flex gap-2">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
//                 >
//                   Send Reset Link
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowForgotModal(false)}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Login;
