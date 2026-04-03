import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import Carousel from "../components/Carousel";
import { fetchProductsPageByCategory } from "../api/api";

// Map of category name → [state, setter]
const CATEGORY_CAROUSELS = [
  "Handloom Sarees",
  "Dokra Art",
  "Jute Products",
  "Terracotta Crafts",
  "Wooden Handicrafts",
  "Bengal Sweets",
];

function HomePage({
  setFilterCategory,
  cart,
  wishlist,
  onAddCart,
  onToggleWish,
  categoryTiles,
  allProducts,
  loading,
}) {
  const navigate = useNavigate();

  // Each category gets its own independent state so carousels render as soon as their data arrives
  const [categoryProducts, setCategoryProducts] = useState(() =>
    Object.fromEntries(CATEGORY_CAROUSELS.map((cat) => [cat, null]))
  );

  const goToShop = useCallback(
    (category) => {
      setFilterCategory(category);
      navigate("/shop", { state: { category } });
    },
    [setFilterCategory, navigate]
  );

  // Fetch each category independently — no more all-or-nothing barrier
  useEffect(() => {
    CATEGORY_CAROUSELS.forEach((cat) => {
      fetchProductsPageByCategory({ category: cat, limit: 20 })
        .then((data) => {
          setCategoryProducts((prev) => ({ ...prev, [cat]: data.products }));
        })
        .catch((err) => {
          console.error(`Error fetching ${cat}:`, err);
          // Set to empty array so carousel is simply hidden, not stuck pending
          setCategoryProducts((prev) => ({ ...prev, [cat]: [] }));
        });
    });
  }, []);

  return (
    <div>
      {/* Gallery Tiles */}
      <div className="section alpona-bg">
        <div className="gallery">
          {categoryTiles.map((tile) => (
            <span
              className="tile"
              key={tile.name}
              onClick={() => goToShop(tile.name)}
            >
              <img src={tile.img} alt={tile.name} />
              <div className="tile-content">
                <span className="tile-label">{tile.name}</span>
              </div>
            </span>
          ))}
        </div>
      </div>

      {/* Trending Products */}
      <Carousel
        title="Trending Products"
        products={allProducts}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
        visibleCount={10}
      />

      {/* Best Sellers */}
      <Carousel
        title="Best Sellers"
        products={[...allProducts].reverse()}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
        visibleCount={10}
      />

      {/* Per-Category Carousels — render each independently as data arrives */}
      {CATEGORY_CAROUSELS.map((cat) => {
        const prods = categoryProducts[cat];
        // null  → still loading → show skeleton
        // []    → loaded but empty → skip
        // [...] → show carousel
        if (prods !== null && prods.length === 0) return null;

        return (
          <Carousel
            key={cat}
            title={cat}
            products={prods || []}
            onShowProduct={(id) => navigate(`/product/${id}`)}
            loading={prods === null}
            visibleCount={10}
          />
        );
      })}
    </div>
  );
}

export default HomePage;
