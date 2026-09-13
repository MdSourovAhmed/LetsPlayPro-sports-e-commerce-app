import React, { useContext, useState } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast"; //Let's make sure react-hot-toast is installed
import { useNavigate } from "react-router-dom";
// import { ShopContext } from "../contexts/AuthContext";

const AuthForm = () => {
  // const { login, signup, setUser, user } = useContext(ShopContext);
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

      // localStorage.setItem("token", response.data.token);
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

export default AuthForm;
