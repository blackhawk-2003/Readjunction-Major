import React, { useEffect, useState } from "react";
import "../styles/FeaturedProducts.css";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const FEATURED_API = "http://localhost:5000/api/v1/products/featured?limit=8";

const ProductCard = ({ product, style }) => (
  <div className="product-card" style={style}>
    <div className="product-card__img-wrap">
      <img
        src={
          product.images && product.images.length > 0
            ? product.images[0].url
            : "/placeholder-image.jpg"
        }
        alt={product.title}
        className="product-card__img"
        onError={(e) => {
          e.target.src = "/placeholder-image.jpg";
        }}
      />
    </div>
    <div className="product-card__info">
      <div className="product-card__title">{product.title}</div>
      <div className="product-card__price">
        ${product.price}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="product-card__compare-price">
            ${product.comparePrice}
          </span>
        )}
      </div>
      <Link
        to={`/products/${product._id}`}
        aria-label={`View details for ${product.title}`}
        className="product-card__btn"
      >
        View <FiArrowRight style={{ marginLeft: 8, verticalAlign: "middle" }} />
      </Link>
    </div>
  </div>
);

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(FEATURED_API)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data);
        } else {
          console.error("Failed to fetch featured products:", data.message);
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching featured products:", error);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  return (
    <section className="featured-products">
      <h2 className="featured-products__title">Featured Products</h2>
      {loading ? (
        <div className="featured-products__loading">
          <div className="featured-products__spinner" />
          Loading products...
        </div>
      ) : products.length > 0 ? (
        <div className="featured-products__grid">
          {products.map((product, idx) => (
            <ProductCard
              key={product._id}
              product={product}
              style={{ "--card-index": idx }}
            />
          ))}
        </div>
      ) : (
        <div className="featured-products__empty">
          <p>No featured products available at the moment.</p>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
