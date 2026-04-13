import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect } from "react";
import Carousel from "../components/Carousel";
import PopupBanner from "../components/PopupBanner";
import { fetchProductsPageByCategory } from "../api/api";
import Banner from "./banner"; 

// Categories
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

  // State for category products
  const [categoryProducts, setCategoryProducts] = useState(() =>
    Object.fromEntries(CATEGORY_CAROUSELS.map((cat) => [cat, null]))
  );

  // Navigate to shop with category
  const goToShop = useCallback(
    (category) => {
      setFilterCategory(category);
      navigate("/shop", { state: { category } });
    },
    [setFilterCategory, navigate]
  );

  // Fetch category products
  useEffect(() => {
    CATEGORY_CAROUSELS.forEach((cat) => {
      fetchProductsPageByCategory({ category: cat, limit: 20 })
        .then((data) => {
          setCategoryProducts((prev) => ({
            ...prev,
            [cat]: data.products,
          }));
        })
        .catch((err) => {
          console.error(`Error fetching ${cat}:`, err);
          setCategoryProducts((prev) => ({
            ...prev,
            [cat]: [],
          }));
        });
    });
  }, []);

  return (
    <div>
      <Banner/>
      {/* ✅ POPUP BANNER */}
      <PopupBanner
        delay={2000}
        onClick={() => navigate("/shop")}
      />

      {/* ✅ Gallery Tiles */}
      <div className="section alpona-bg">
        {/* <img className="tiffinHubBanner" src="https://res.cloudinary.com/dnplp91xz/image/upload/q_auto/f_auto/v1775738230/BannerOfSH_pwmgym.jpg" alt="" /> */}
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

      {/* ✅ Trending Products */}
      <Carousel
        title="Trending Products"
        products={allProducts}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
        visibleCount={10}
      />

      {/* ✅ Best Sellers */}
      <Carousel
        title="Best Sellers"
        products={[...allProducts].reverse()}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
        visibleCount={10}
      />

      {/* ✅ Category Carousels */}
      {CATEGORY_CAROUSELS.map((cat) => {
        const prods = categoryProducts[cat];

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