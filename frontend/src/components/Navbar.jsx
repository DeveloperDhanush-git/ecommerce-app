import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";
import { toast } from "react-toastify";

function Navbar() {
  const [search, setSearch] = useState("");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Sync search input with URL (Amazon behavior)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("search") || "";

    // Only update search input if we are on allproducts page
    if (location.pathname === "/allproducts") {
      setSearch(searchQuery);
    } else {
      setSearch(""); // clear when moving to other pages
    }
  }, [location]);

  // 🔐 Login state
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!getToken());
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // 🔽 Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate("/auth");
  };

const handleSearch = () => {
  if (search.trim()) {
    navigate(`/allproducts?page=1&search=${encodeURIComponent(search.trim())}`);
  } else {
    navigate("/allproducts?page=1");
  }
};
const handleBack =()=>{
  navigate("/")
}

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-[#131921] text-white px-6 py-3 flex items-center justify-between transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <Link
        to="/categories"
        className="text-2xl font-bold hover:border border-white px-2 py-1"
      >
        MyShop
      </Link>

      {/* 🔍 Search Bar */}
      <div className="hidden md:flex flex-1 mx-6 max-w-2xl">
        <button className="bg-yellow-400 px-4 text-black font-semibold hover:bg-yellow-500"
        onClick={handleBack}
        >Back</button>
        <input
  type="text"
  placeholder="Search products..."
  value={search}
  onChange={(e) => {
    const value = e.target.value;
    setSearch(value);

    // 🔥 If user clears search → show all products
    if (value.trim() === "" && location.pathname === "/allproducts") {
      navigate("/allproducts?page=1");
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      if (search.trim()) {
        navigate(`/allproducts?page=1&search=${encodeURIComponent(search.trim())}`);
      } else {
        navigate("/allproducts?page=1");
      }
    }
  }}
  className="flex-1 px-4 py-2 text-black outline-none"
/>


        <button
          onClick={handleSearch}
          className="bg-yellow-400 px-4 text-black font-semibold hover:bg-yellow-500"
        >
          Search
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6 text-sm">

        <Link to="/categories" className="hover:underline">
          Home
        </Link>

        <Link to="/allproducts?page=1" className="hover:underline">
          All Products
        </Link>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="hover:underline">
            Logout
          </button>
        ) : (
          <Link to="/auth" className="hover:underline">
            Login
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;
