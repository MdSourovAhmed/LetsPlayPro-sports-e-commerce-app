import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { GuestRoute } from "./components/auth/GuestRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AccountLayout } from "./components/account/AccountLayout";
import { useAuthBoot } from "./hooks/useAuthBoot";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";

const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Compare = lazy(() => import("./pages/Compare"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Terms = lazy(() => import("./pages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Dashboard = lazy(() => import("./pages/account/Dashboard"));
const Profile = lazy(() => import("./pages/account/Profile"));
const AddressBook = lazy(() => import("./pages/account/AddressBook"));
const Orders = lazy(() => import("./pages/account/Orders"));
const OrderDetails = lazy(() => import("./pages/account/OrderDetails"));
const Settings = lazy(() => import("./pages/account/Settings"));

function PageFallback() {
  return <div className="container-page py-32 text-center text-sm text-ink-soft">Loading…</div>;
}

function withSuspense(element) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

export default function App() {
  // Kicks off the boot-time refresh-token exchange (if a session was persisted) and drives
  // useAuthStore's isBooting flag. ProtectedRoute/GuestRoute read isBooting directly from the
  // store, so nothing needs to be threaded through here — see useAuthBoot.js.
  useAuthBoot();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={withSuspense(<Checkout />)} />
        <Route path="/order-success" element={withSuspense(<OrderSuccess />)} />
        <Route path="/wishlist" element={withSuspense(<Wishlist />)} />
        <Route path="/compare" element={withSuspense(<Compare />)} />
        <Route path="/about" element={withSuspense(<About />)} />
        <Route path="/contact" element={withSuspense(<Contact />)} />
        <Route path="/faq" element={withSuspense(<FAQ />)} />
        <Route path="/terms" element={withSuspense(<Terms />)} />
        <Route path="/privacy-policy" element={withSuspense(<PrivacyPolicy />)} />
        <Route path="/refund-policy" element={withSuspense(<RefundPolicy />)} />
        <Route path="/maintenance" element={withSuspense(<Maintenance />)} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={withSuspense(<Login />)} />
          <Route path="/register" element={withSuspense(<Register />)} />
          <Route path="/forgot-password" element={withSuspense(<ForgotPassword />)} />
          <Route path="/reset-password" element={withSuspense(<ResetPassword />)} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AccountLayout />}>
            <Route path="/account" element={withSuspense(<Dashboard />)} />
            <Route path="/account/profile" element={withSuspense(<Profile />)} />
            <Route path="/account/addresses" element={withSuspense(<AddressBook />)} />
            <Route path="/account/orders" element={withSuspense(<Orders />)} />
            <Route path="/account/orders/:orderId" element={withSuspense(<OrderDetails />)} />
            <Route path="/account/settings" element={withSuspense(<Settings />)} />
          </Route>
        </Route>

        <Route path="*" element={withSuspense(<NotFound />)} />
      </Route>
    </Routes>
  );
}
