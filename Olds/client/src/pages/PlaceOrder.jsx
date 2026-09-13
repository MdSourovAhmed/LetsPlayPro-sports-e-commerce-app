import React, { useContext, useState } from "react";
import Title from "../components/Title";
import { ShopContext } from "../contexts/ShopContext";
import TotalOrder from "./TotalOrder";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import api from "../utils/api"; // assuming you’ve set this

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalCartAmount, clearCart, user } =
    useContext(ShopContext);
  const totalAmount = getTotalCartAmount();
  const itemsArray = Object.entries(cartItems)
    .filter(([_, item]) => item.quantity > 0)
    .map(([id, item]) => ({
      productId: id,
      quantity: item.quantity,
      size: item.size,
    }));

  const [method, setMethod] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    country: "",
    phone: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    if (!formData.firstName || !formData.phone) {
      toast.error("Please fill all required fields!");
      return;
    }

    const orderData = {
      userId: user?._id,
      deliveryInfo: formData,
      items: itemsArray,
      paymentMethod: method,
      totalAmount,
    };

    try {
      // const res = await api.post(`${backendUrl}/api/order/place`, orderData, {
      //   headers: { Authorization: `Bearer ${user?.token}` },
      // });

      const res = await api.post("/place-order", orderData);
      console.log(res);

      if (res.data.success) {
        toast.success("Order placed successfully!");
        clearCart();
        navigate("/orders");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error placing order!");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-gray-400 ">
      {/* Left: Delivery Form */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px] ">
        <div className="text-xl sm:text-2xl my-3 ">
          <Title t1={"DELIVERY"} t2={"INFORMATION"} />
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Last Name"
          />
        </div>

        <div className="flex gap-3">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Email Address"
          />
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Street"
          />
        </div>

        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          placeholder="City"
        />

        <div className="flex gap-3">
          <input
            type="number"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Zip Code"
          />
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            placeholder="Country"
          />
        </div>

        <input
          type="number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          placeholder="Phone Number"
        />
      </div>

      {/* Right: Order Summary */}
      <div className="mt-8 ">
        <div className="mt-8 min-w-80">
          <TotalOrder itemsArray={itemsArray} totalAmount={totalAmount} />
        </div>
        <div className="mt-12">
          <Title t1={"PAYMENT"} t2={"METHOD"} />
          <div className="flex gap-3 flex-col lg:flex-row">
            {["bkash", "nagad", "cod"].map((m) => (
              <div
                key={m}
                onClick={() => setMethod(m)}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === m ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4 uppercase">
                  {m}
                </p>
              </div>
            ))}
          </div>

          <div className="w-fit text-end mt-8">
            <button
              onClick={handlePlaceOrder}
              className="bg-gray-900 cursor-pointer rounded-sm text-white px-16 py-3 text-sm"
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;

// import React, { useContext, useState } from "react";
// import Title from "../components/Title";
// import { ShopContext } from "../contexts/ShopContext";
// import TotalOrder from "./TotalOrder";
// import { useNavigate } from "react-router-dom";

// const PlaceOrder = () => {
//   const navigate = useNavigate();
//   const { cartItems, getTotalCartAmount } = useContext(ShopContext);
//   const totalAmount = getTotalCartAmount();
//   const itemsArray = Object.values(cartItems);
//   const [method, setMethod] = useState("cod");
//   return (
//     <div className="flex flex-col sm:flex-row justify-center gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-gray-400 ">
//       <div className="flex flex-col gap-4 w-full sm:max-w-[480px] ">
//         <div className="text-xl sm:text-2xl my-3 ">
//           <Title t1={"DELIVERY"} t2={"INFORMATION"} />
//         </div>
//         <div className="flex gap-3">
//           <input
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="First Name"
//           />
//           <input
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Last Name"
//           />
//         </div>
//         <div className="flex gap-3">
//           <input
//             type="email"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Email Address"
//           />
//           <input
//             type="email"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Street"
//           />
//         </div>
//         <input
//           type="text"
//           className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//           placeholder="City"
//         />
//         <div className="flex gap-3">
//           <input
//             type="number"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Zip Code"
//           />
//           <input
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Country"
//           />
//         </div>
//         <input
//           type="number"
//           className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//           placeholder="Phone Number"
//         />
//       </div>

//       {/* Right Sidebar */}
//       <div className="mt-8 ">
//         <div className="mt-8 min-w-80">
//           <TotalOrder itemsArray={itemsArray} totalAmount={totalAmount} />
//         </div>
//         <div className="mt-12">
//           <Title t1={"PAYMENT"} t2={"METHOD"} />
//           <div className="flex gap-3 flex-col lg:flex-row">
//             <div
//               onClick={() => setMethod("bkash")}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "bkash" ? "bg-green-400" : ""
//                 }`}
//               ></p>
//               <img src="" className="h-5 mx-4" alt="Bkash" />
//             </div>
//             <div
//               onClick={() => setMethod("nagad")}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "nagad" ? "bg-green-400" : ""
//                 }`}
//               ></p>
//               <img src="" className="h-5 mx-4" alt="Nagad" />
//             </div>
//             <div
//               onClick={() => setMethod("cod")}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "cod" ? "bg-green-400" : ""
//                 }`}
//               ></p>
//               <p className="text-gray-500 text-sm font-medium mx-4">
//                 CASH ON DELIVERY
//               </p>
//             </div>
//           </div>
//           <div className="w-fit text-end mt-8">
//             <button
//               onClick={() => navigate("/orders")}
//               className="bg-gray-900 cursor-pointer rounded-sm text-white px-16 py-3 text-sm"
//             >
//               PLACE ORDER
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlaceOrder;

// import React, { useContext, useState } from "react";
// import Title from "../components/Title";
// import { ShopContext } from "../contexts/ShopContext";
// import TotalOrder from "./TotalOrder";
// import { useNavigate } from "react-router-dom";
// import api from "../utils/api.js"; // Your API instance

// const PlaceOrder = () => {
//   const navigate = useNavigate();
//   const { cartItems, getTotalCartAmount, clearCart, user } =
//     useContext(ShopContext); // Assume user from context
//   const totalAmount = getTotalCartAmount();
//   const itemsArray = Object.entries(cartItems)
//     .filter(([_, qty]) => qty > 0)
//     .map(([productId, quantity]) => ({ product: productId, quantity })); // Map cart to items

//   const [method, setMethod] = useState("cod");
//   const [shippingAddress, setShippingAddress] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     street: "",
//     city: "",
//     zip: "",
//     country: "",
//     phone: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setShippingAddress((prev) => ({ ...prev, [name]: value }));
//   };

//   const validateForm = () => {
//     const requiredFields = [
//       "firstName",
//       "lastName",
//       "email",
//       "street",
//       "city",
//       "zip",
//       "country",
//       "phone",
//     ];
//     return requiredFields.every((field) => shippingAddress[field].trim());
//   };

//   const handlePlaceOrder = async () => {
//     if (!validateForm()) {
//       setError("Please fill all required fields");
//       return;
//     }
//     if (itemsArray.length === 0) {
//       setError("Cart is empty");
//       return;
//     }
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       const response = await api.post("/orders", {
//         items: itemsArray,
//         shippingAddress,
//         paymentMethod: method,
//         totalAmount,
//       });

//       if (response.data.message.includes("Redirecting")) {
//         // Handle payment gateway (e.g., window.location = response.data.paymentUrl)
//         alert(`${method.toUpperCase()} Payment Required`);
//       } else {
//         clearCart(); // Clear cart on success
//         navigate("/orders", { state: { order: response.data.order } }); // Pass order for display
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to place order");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col sm:flex-row justify-center gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-gray-400">
//       <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
//         <div className="text-xl sm:text-2xl my-3">
//           <Title t1={"DELIVERY"} t2={"INFORMATION"} />
//         </div>
//         {error && <p className="text-red-500 text-sm text-center">{error}</p>}
//         <div className="flex gap-3">
//           <input
//             name="firstName"
//             value={shippingAddress.firstName}
//             onChange={handleInputChange}
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="First Name *"
//             required
//           />
//           <input
//             name="lastName"
//             value={shippingAddress.lastName}
//             onChange={handleInputChange}
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Last Name *"
//             required
//           />
//         </div>
//         <div className="flex gap-3">
//           <input
//             name="email"
//             value={shippingAddress.email}
//             onChange={handleInputChange}
//             type="email"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Email Address *"
//             required
//           />
//           <input
//             name="street"
//             value={shippingAddress.street}
//             onChange={handleInputChange}
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Street *"
//             required
//           />
//         </div>
//         <input
//           name="city"
//           value={shippingAddress.city}
//           onChange={handleInputChange}
//           type="text"
//           className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//           placeholder="City *"
//           required
//         />
//         <div className="flex gap-3">
//           <input
//             name="zip"
//             value={shippingAddress.zip}
//             onChange={handleInputChange}
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Zip Code *"
//             required
//           />
//           <input
//             name="country"
//             value={shippingAddress.country}
//             onChange={handleInputChange}
//             type="text"
//             className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//             placeholder="Country *"
//             required
//           />
//         </div>
//         <input
//           name="phone"
//           value={shippingAddress.phone}
//           onChange={handleInputChange}
//           type="tel"
//           className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
//           placeholder="Phone Number *"
//           required
//         />
//       </div>

//       {/* Right Sidebar */}
//       <div className="mt-8">
//         <div className="mt-8 min-w-80">
//           <TotalOrder itemsArray={itemsArray} totalAmount={totalAmount} />
//         </div>
//         <div className="mt-12">
//           <Title t1={"PAYMENT"} t2={"METHOD"} />
//           <div className="flex gap-3 flex-col lg:flex-row">
//             <div
//               onClick={() => setMethod("bkash")}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "bkash" ? "bg-green-400" : ""
//                 }`}
//               ></p>
//               <img src="" className="h-5 mx-4" alt="Bkash" />{" "}
//               {/* Add actual image */}
//             </div>
//             <div
//               onClick={() => setMethod("nagad")}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "nagad" ? "bg-green-400" : ""
//                 }`}
//               ></p>
//               <img src="" className="h-5 mx-4" alt="Nagad" />{" "}
//               {/* Add actual image */}
//             </div>
//             <div
//               onClick={() => setMethod("cod")}
//               className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
//             >
//               <p
//                 className={`min-w-3.5 h-3.5 border rounded-full ${
//                   method === "cod" ? "bg-green-400" : ""
//                 }`}
//               ></p>
//               <p className="text-gray-500 text-sm font-medium mx-4">
//                 CASH ON DELIVERY
//               </p>
//             </div>
//           </div>
//           <div className="w-fit text-end mt-8">
//             <button
//               onClick={handlePlaceOrder}
//               disabled={loading || itemsArray.length === 0}
//               className={`bg-gray-900 cursor-pointer rounded-sm text-white px-16 py-3 text-sm ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {loading ? "Placing Order..." : "PLACE ORDER"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PlaceOrder;
