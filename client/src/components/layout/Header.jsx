import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { useCartStore, selectCartItemCount } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuthStore } from "../../store/useAuthStore";
import { cn } from "../../utils/cn";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Collection" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemCount = useCartStore(selectCartItemCount);
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <Link to="/" className="font-display text-xl leading-none text-ink">
          Lets<span className="block">PlayPro</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm text-ink-soft transition-colors hover:text-ink",
                  isActive && "font-medium text-ink underline underline-offset-4"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search"
            className="text-ink transition-colors hover:text-ink-soft"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            aria-label="Account"
            className="text-ink transition-colors hover:text-ink-soft"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="relative text-ink transition-colors hover:text-ink-soft">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-white">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative text-ink transition-colors hover:text-ink-soft">
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="text-ink md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line bg-paper">
          <form onSubmit={handleSearchSubmit} className="container-page flex items-center gap-3 py-3">
            <Search className="h-4 w-4 text-ink-soft" />
            <input
              autoFocus
              type="search"
              placeholder="Search for gear, brands, sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
            />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
              <X className="h-4 w-4 text-ink-soft" />
            </button>
          </form>
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="relative ml-auto flex h-full w-72 flex-col gap-1 bg-paper p-6">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="mb-6 self-end text-ink"
            >
              <X className="h-5 w-5" />
            </button>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn("border-b border-line py-3 text-sm text-ink-soft", isActive && "font-medium text-ink")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
