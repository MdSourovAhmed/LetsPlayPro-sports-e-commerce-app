// import { useState } from "react";
// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";
// import { Routes, Route } from "react-router-dom";
// import Add from "./pages/Add";
// import List from "./pages/List";
// import Orders from "./pages/Orders";
// import "./App.css";

// function App() {
//   const [count, setCount] = useState(0);

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <>
//         <Navbar />
//         <hr />
//         <div className="flex w-full">
//           <Sidebar />
//           <div>
//             <Routes>
//               <Route path="/add" element={<Add />} />
//               <Route path="/list" element={<List />} />
//               <Route path="/orders" element={<Orders />} />
//             </Routes>
//           </div>
//         </div>
//       </>
//     </div>
//   );
// }

// export default App;


import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Routes, Route } from "react-router-dom";
import Add from "./pages/Add";
import List from "./pages/List";
import Orders from "./pages/Orders";
import "./App.css";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Navbar */}
      <Navbar />
      <hr />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/add" element={<Add />} />
            <Route path="/list" element={<List />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
