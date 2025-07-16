import React, { useState, useRef, useEffect } from "react";
import { FiUser, FiHeart, FiShoppingCart, FiSearch } from "react-icons/fi";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo-transparent.png";
import "../styles/Navbar.css";

const iconProps = { size: 28, color: "#222" };
const CATEGORY_API = "http://localhost:5000/api/v1/products/categories";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catLoaded, setCatLoaded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");
  const hasFetched = useRef(false);
  const navigate = useNavigate();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("navbar__sidebar-open");
    } else {
      document.body.classList.remove("navbar__sidebar-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("navbar__sidebar-open");
    };
  }, [isSidebarOpen]);

  const fetchCategories = async () => {
    if (hasFetched.current) return;
    setCatLoading(true);
    try {
      const response = await fetch(CATEGORY_API);
      const data = await response.json();

      if (data.success && data.data && data.data.categories) {
        setCategories(data.data.categories);
      } else {
        console.error("Failed to fetch categories:", data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setCatLoading(false);
      setCatLoaded(true);
      hasFetched.current = true;
    }
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    if (category) {
      // Navigate to category page
      const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
      navigate(`/category/${categorySlug}`);

      // Reset selection after navigation
      setTimeout(() => {
        setSelectedCategory("");
      }, 100);
    }
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      const searchParams = new URLSearchParams({ search: query.trim() });
      navigate(`/products?${searchParams.toString()}`);
      setSearchQuery("");
      setSidebarSearchQuery("");
      closeSidebar();
    }
  };

  const handleDesktopSearch = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleSidebarSearch = (e) => {
    e.preventDefault();
    handleSearch(sidebarSearchQuery);
  };

  const handleKeyPress = (e, query) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <div className="navbar__sticky-container">
        <nav className="navbar navbar--modern-align">
          {/* Left: Hamburger (mobile only) */}
          <div className="navbar__section navbar__section--left">
            <button
              className="navbar__hamburger"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Bars3Icon className="hamburger-icon" />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="navbar__section navbar__section--center">
            <Link
              to="/"
              aria-label="Go to homepage"
              onClick={closeSidebar}
              className="navbar__logo-link"
            >
              <img
                src={logoImg}
                alt="ReadJunction Logo"
                className="navbar__logo-img navbar__logo-img--transparent"
              />
              <span className="navbar__logo-text">ReadJunction</span>
            </Link>
          </div>

          {/* Right: Desktop items */}
          <div className="navbar__section navbar__section--right navbar__desktop-only">
            <div className="navbar__dropdown-wrap">
              <select
                className="navbar__dropdown navbar__dropdown--modern"
                disabled={catLoading && !catLoaded}
                value={selectedCategory}
                onChange={handleCategoryChange}
                onClick={fetchCategories}
              >
                <option value="">Category</option>
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="navbar__dropdown-option"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <select className="navbar__dropdown">
              <option>What's new</option>
            </select>
            <form
              className="navbar__search-group"
              onSubmit={handleDesktopSearch}
            >
              <input
                className="navbar__search"
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) =>
                  handleKeyPress(e, searchQuery, setSearchQuery)
                }
              />
              <button
                type="submit"
                className="navbar__search-btn"
                aria-label="Search"
                onClick={handleDesktopSearch}
              >
                <FiSearch {...iconProps} />
              </button>
            </form>
            <button className="navbar__icon-btn" aria-label="User">
              <FiUser {...iconProps} />
            </button>
            <button className="navbar__icon-btn" aria-label="Wishlist">
              <FiHeart {...iconProps} />
            </button>
            <button className="navbar__icon-btn" aria-label="Cart">
              <FiShoppingCart {...iconProps} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`navbar__sidebar ${
          isSidebarOpen ? "navbar__sidebar--open" : ""
        }`}
      >
        <div className="navbar__sidebar-overlay" onClick={closeSidebar}></div>
        <div className="navbar__sidebar-content">
          <div className="navbar__sidebar-header">
            <div className="navbar__sidebar-logo-wrap">
              <Link to="/" onClick={closeSidebar}>
                <img
                  src={logoImg}
                  alt="ReadJunction Logo"
                  className="navbar__sidebar-logo"
                />
              </Link>
            </div>
            <button
              className="navbar__sidebar-close"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <XMarkIcon className="hamburger-icon" />
            </button>
          </div>

          <div className="navbar__sidebar-body">
            {/* Search in Sidebar */}
            <div className="navbar__sidebar-search">
              <form
                className="navbar__search-group navbar__search-group--sidebar"
                onSubmit={handleSidebarSearch}
              >
                <input
                  className="navbar__search"
                  type="text"
                  placeholder="What are you looking for?"
                  value={sidebarSearchQuery}
                  onChange={(e) => setSidebarSearchQuery(e.target.value)}
                  onKeyPress={(e) =>
                    handleKeyPress(e, sidebarSearchQuery, setSidebarSearchQuery)
                  }
                />
                <button
                  type="submit"
                  className="navbar__search-btn"
                  aria-label="Search"
                  onClick={handleSidebarSearch}
                >
                  <FiSearch size={20} />
                </button>
              </form>
            </div>

            {/* Categories in Sidebar */}
            <div className="navbar__sidebar-section">
              <h3 className="navbar__sidebar-title">Categories</h3>
              <select
                className="navbar__dropdown navbar__dropdown--sidebar"
                disabled={catLoading && !catLoaded}
                value={selectedCategory}
                onChange={handleCategoryChange}
                onClick={fetchCategories}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="navbar__dropdown-option"
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* What's New in Sidebar */}
            <div className="navbar__sidebar-section">
              <h3 className="navbar__sidebar-title">What's New</h3>
              <select className="navbar__dropdown navbar__dropdown--sidebar">
                <option>Select Option</option>
              </select>
            </div>

            {/* Navigation Items in Sidebar */}
            <div className="navbar__sidebar-section">
              <h3 className="navbar__sidebar-title">Account</h3>
              <div className="navbar__sidebar-nav">
                <button className="navbar__sidebar-nav-item">
                  <FiUser size={20} />
                  <span>Profile</span>
                </button>
                <button className="navbar__sidebar-nav-item">
                  <FiHeart size={20} />
                  <span>Wishlist</span>
                </button>
                <button className="navbar__sidebar-nav-item">
                  <FiShoppingCart size={20} />
                  <span>Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
