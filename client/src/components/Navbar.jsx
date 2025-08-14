import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faBars,
  faCartShopping,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useEffect, useRef, useState } from "react";
import { DarkModeContext } from "../context/DarkmoodContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useSearch } from "../context/SearchContext.jsx";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleDarkMode } = useContext(DarkModeContext);
  const { user, logout } = useContext(AuthContext);
  let firstLetter = user?.username.split(" ")[0].charAt(0).toUpperCase();
  let lastLetter = user?.username.split(" ")[1]?.charAt(0).toUpperCase() || "";
  let initials = firstLetter + lastLetter;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdownSearch, setShowDropdownSearch] = useState(false);
  const { searchValue, setSearchValue } = useSearch();

  const { cart } = useCart();
  const itemCount =
    (user && cart?.products?.reduce((sum, item) => sum + item.quantity, 0)) ||
    0;
  const subtotal =
    (user &&
      cart?.products?.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
      )) ||
    0;

  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/products" },
    { label: "Categories", path: "/categories" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false);
        setShowDropdownSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowDropdownSearch(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = () => {
    if (location.pathname !== "/products") {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
    } else {
      navigate({
        pathname: "/products",
        search: `?search=${encodeURIComponent(searchValue)}`,
      });
    }
    setIsSearchFocused(false);
    setShowDropdownSearch(false);
  };

  return (
    <>
      {isSearchFocused && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setIsSearchFocused(false);
            setShowDropdownSearch(false);
          }}
        ></div>
      )}
      <nav className="w-full shadow-md px-5 py-3 bg-base-100 text-base-content sticky top-0 z-50">
        <div className="flex justify-between items-center">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-[200px] h-fit cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Center: Search */}
          <div className="w-full flex md:justify-center md:items-center sm:justify-end">
            <div className="flex flex-col w-[40%] gap-3">
              <div
                ref={searchRef}
                className={`hidden md:flex items-center gap-3 w-full border px-3 py-3 rounded-full border-gray-400 bg-base-200 transition-all ${
                  isSearchFocused ? "outline outline-[#0098b3]" : ""
                }`}
                onClick={() => {
                  setIsSearchFocused(true);
                  inputRef.current?.focus();
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="What are you looking for..."
                  className="w-full bg-transparent outline-none"
                />
                <button onClick={handleSearch}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
              </div>

              <div className="hidden md:flex justify-center mt-3">
                <ul className="flex gap-6 text-lg font-medium">
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="hover:text-[#0098b3] transition-all"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mobile search icon */}
            <button
              className="md:hidden btn btn-ghost btn-circle"
              onClick={() => {
                setShowDropdownSearch(true);
                setIsSearchFocused(true);
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg " />
            </button>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-4">
            {/* Dark Mode */}
            <label className="swap swap-rotate cursor-pointer">
              <input type="checkbox" onClick={toggleDarkMode} />
              <FontAwesomeIcon
                icon={faSun}
                style={{
                  stroke: "#0098b3",
                  strokeWidth: 20,
                  fill: "none",
                  color: "#1D222B",
                }}
                className="text-3xl swap-on"
              />
              <FontAwesomeIcon
                icon={faMoon}
                style={{
                  stroke: "#0098b3",
                  strokeWidth: 20,
                  fill: "none",
                  color: "#1D222B",
                }}
                className="text-3xl swap-off"
              />
            </label>

            {/* Cart */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
              >
                <div className="indicator">
                  <FontAwesomeIcon
                    icon={faCartShopping}
                    style={{
                      stroke: "#0098b3",
                      strokeWidth: 20,
                      fill: "none",
                      color: "#1D222B",
                    }}
                    className="text-2xl"
                  />
                  <span className="badge badge-sm indicator-item">
                    {itemCount}
                  </span>
                </div>
              </div>
              <div className="card dropdown-content card-compact mt-3 w-52 bg-base-100 shadow z-50">
                <div className="card-body">
                  <span className="font-bold text-lg">
                    {itemCount} {itemCount === 1 ? "Item" : "Items"}
                  </span>
                  <span className="text-info">Subtotal: L.E{subtotal}</span>
                  <div className="card-actions">
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => navigate("/cart")}
                    >
                      View Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* User / Login */}
            {user ? (
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="size-12 text-2xl mt-2 font-semibold text-center rounded-full">
                    {initials}
                  </div>
                </div>
                <ul className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                    <Link to="/settings">Settings</Link>
                  </li>
                  <li>
                    <button onClick={logout}>Logout</button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                className="btn bg-[#0098b3] text-slate-200 hover:bg-[#36b0c6] transition"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}

            {/* Hamburger menu */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn btn-ghost btn-circle"
              >
                <FontAwesomeIcon icon={faBars} className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden mt-3">
            <ul className="menu bg-base-200 rounded-box p-2 w-full">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mobile Search Bar */}
        {showDropdownSearch && (
          <div className="absolute top-0 left-0 w-full z-50 bg-base-100 p-4 shadow-md animate-slideDown flex justify-center">
            <div
              ref={dropdownRef}
              className="w-full max-w-sm flex items-center gap-3 border px-4 py-3 rounded-md border-gray-400 bg-base-200"
            >
              <button
                onClick={() => {
                  setShowDropdownSearch(false);
                  setIsSearchFocused(false);
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="What are you looking for..."
                className="w-full bg-transparent outline-none"
              />
              <button
                className="md:hidden btn btn-ghost btn-circle"
                onClick={handleSearch}
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
