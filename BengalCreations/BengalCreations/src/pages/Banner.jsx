import axios from "axios";

const Banner = () => {
  const token = localStorage.getItem("token");

  const handleBannerClick = async () => {
    console.log("clicked banner")
    try {
      const res = await axios.post(
        "/api/coupon/generate",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Coupon:", res.data);

      // 👉 optional: store coupon
      localStorage.setItem("coupon", res.data.code);

      alert(`Coupon Applied: ${res.data.code}`);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div
      onClick={handleBannerClick}
      style={{
        background: "#ffcc00",
        padding: "20px",
        cursor: "pointer",
        textAlign: "center",
      }}
    >
      🎉 Click here to get 20% OFF on your first order!
    </div>
  );
};

export default Banner;