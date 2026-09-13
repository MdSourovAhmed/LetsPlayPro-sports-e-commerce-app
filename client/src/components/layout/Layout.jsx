import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CompareBar } from "../product/CompareBar";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-14">
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
    </div>
  );
}
