import React from "react";
import { useNavigate } from "react-router-dom";

const TotalOrder = ({ itemsArray, totalAmount }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full lg:w-1/3 bg-gray-50 rounded-xl p-6 h-fit shadow-sm">
      <h2 className="text-xl font-medium mb-4">Order Summary</h2>
      <div className="flex justify-between text-gray-600 mb-2">
        <span>Items ({itemsArray.length})</span>
        <span>
          {itemsArray.reduce((total, i) => total + i.quantity, 0)} pcs
        </span>
      </div>
      <div className="flex justify-between text-gray-600 mb-4">
        <span>Subtotal</span>
        {/* <span>${totalAmount.toFixed(2)}</span> */}
        <span>${totalAmount}</span>
      </div>
      <div className="border-t pt-4 flex justify-between font-semibold text-lg">
        <span>Total</span>
        {/* <span>${totalAmount.toFixed(2)}</span> */}
        <span>${totalAmount}</span>
      </div>

      {/* <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => navigate("/place-order")}
          className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
        >
          Proceed to Checkout
        </button>
        <button
          onClick={() => navigate("/collection")}
          className="w-full py-3 border border-gray-400 rounded-md hover:bg-gray-100 transition"
        >
          Continue Shopping
        </button>
      </div> */}
    </div>
  );
};

export default TotalOrder;
