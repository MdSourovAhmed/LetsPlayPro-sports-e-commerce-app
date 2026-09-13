import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const COMPANY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/faq", label: "FAQ" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/refund-policy", label: "Refund Policy" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed! Enjoy 20% off your first order.");
    setEmail("");
  }

  return (
    <footer className="mt-24 border-t border-line">
      <div className="container-page flex flex-col items-center gap-4 py-16 text-center">
        <span className="accent-bar" />
        <h3 className="font-display text-2xl text-ink">Subscribe now &amp; get 20% off</h3>
        <p className="max-w-md text-sm text-ink-soft">
          Be the first to hear about new drops, restocks, and member-only pricing.
        </p>
        <form onSubmit={handleSubscribe} className="mt-2 flex w-full max-w-md">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink px-4 py-3 text-sm outline-none"
          />
          <button type="submit" className="shrink-0 bg-ink px-6 text-xs font-medium uppercase tracking-wide text-white">
            Subscribe
          </button>
        </form>
      </div>

      <div className="container-page grid grid-cols-1 gap-10 border-t border-line py-12 sm:grid-cols-3">
        <div className="flex flex-col gap-3">
          <span className="font-display text-lg text-ink">LetsPlayPro</span>
          <p className="max-w-xs text-sm text-ink-soft">
            Premium gear for every sport, every level. Built for athletes who take their game
            seriously.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink">Company</h4>
          {COMPANY_LINKS.map((link) => (
            <Link key={link.label} to={link.to} className="text-sm text-ink-soft hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink">Get In Touch</h4>
          <a href="tel:+8801723479072" className="text-sm text-ink-soft hover:text-ink">
            +88-01723-479072
          </a>
          <a href="mailto:contact@letsplaypro.com" className="text-sm text-ink-soft hover:text-ink">
            contact@letsplaypro.com
          </a>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">
        Copyright © {new Date().getFullYear()} LetsPlayPro. All Rights Reserved.
      </div>
    </footer>
  );
}
