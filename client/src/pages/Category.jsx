import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiFilter,
  FiDollarSign,
  FiStar,
  FiBookOpen,
  FiGlobe,
  FiRefreshCw,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import "../styles/Products.css";

const CategoryFilters = () => (
  <aside className="products__filters" aria-label="Category Filters">
    <div className="products__filters-header">
      <FiFilter className="products__filters-icon" />
      <h2>Filters</h2>
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">
        <FiDollarSign /> Price Range
      </div>
      <div className="products__filter-options products__filter-options--row">
        <input
          type="number"
          placeholder="Min"
          className="products__price-input"
          aria-label="Min price"
        />
        <span className="products__price-sep">-</span>
        <input
          type="number"
          placeholder="Max"
          className="products__price-input"
          aria-label="Max price"
        />
      </div>
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">
        <FiStar /> Rating
      </div>
      <div className="products__filter-options">
        <label className="products__checkbox">
          <input type="checkbox" /> 4★ & up
        </label>
        <label className="products__checkbox">
          <input type="checkbox" /> 3★ & up
        </label>
      </div>
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">
        <FiRefreshCw /> Sort by
      </div>
      <select className="products__sort-select" aria-label="Sort by">
        <option>Relevance</option>
        <option>Price: Low to High</option>
        <option>Price: High to Low</option>
        <option>Newest</option>
        <option>Rating</option>
      </select>
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">Availability</div>
      <div className="products__filter-options">
        <label className="products__checkbox">
          <input type="checkbox" /> In Stock
        </label>
        <label className="products__checkbox">
          <input type="checkbox" /> Out of Stock
        </label>
      </div>
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">Author/Publisher</div>
      <input
        type="text"
        placeholder="Search..."
        className="products__author-input"
        aria-label="Author or Publisher"
      />
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">
        <FiGlobe /> Language
      </div>
      <div className="products__filter-options">
        <label className="products__checkbox">
          <input type="checkbox" /> English
        </label>
        <label className="products__checkbox">
          <input type="checkbox" /> Hindi
        </label>
      </div>
    </div>
    <div className="products__filter-section">
      <div className="products__filter-title">Condition</div>
      <div className="products__filter-options">
        <label className="products__checkbox">
          <input type="checkbox" /> New
        </label>
        <label className="products__checkbox">
          <input type="checkbox" /> Used
        </label>
      </div>
    </div>
    <button className="products__clear-btn" aria-label="Clear all filters">
      <FiRefreshCw style={{ marginRight: 8, verticalAlign: "middle" }} /> Clear
      Filters
    </button>
  </aside>
);

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const encodedCategory = encodeURIComponent(categoryName);
    fetch(`http://localhost:5000/api/v1/products?category=${encodedCategory}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data.products);
        } else {
          setError(data.message || "Failed to load products.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching category products:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  }, [categoryName]);

  // Format category name for display (capitalize first letter, replace dashes with spaces)
  const formatCategoryName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="products__container">
      <CategoryFilters />
      <main className="products__main">
        <h1 className="products__title">{formatCategoryName(categoryName)}</h1>
        {loading ? (
          <div className="products__loading">
            <div className="products__spinner"></div>
            <span>Loading products...</span>
          </div>
        ) : error ? (
          <div className="products__error">{error}</div>
        ) : products.length > 0 ? (
          <div className="products__grid">
            {products.map((product) => (
              <div className="products__card" key={product._id}>
                <div className="products__card-img-wrap">
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? product.images[0].url
                        : "/placeholder-image.jpg"
                    }
                    alt={product.title}
                    className="products__card-img"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                </div>
                <div className="products__card-info">
                  <h2 className="products__card-title">{product.title}</h2>
                  <div className="products__card-price">
                    ${product.price}
                    {product.comparePrice &&
                      product.comparePrice > product.price && (
                        <span className="products__card-compare-price">
                          ${product.comparePrice}
                        </span>
                      )}
                  </div>
                  <Link
                    to={`/products/${product._id}`}
                    aria-label={`View details for ${product.title}`}
                    className="products__card-btn products__card-btn--cta"
                  >
                    View <FiArrowRight className="products__card-btn-icon" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products__empty">
            <p>No products found in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Category;
