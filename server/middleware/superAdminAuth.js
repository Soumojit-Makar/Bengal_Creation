const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin") {
      return res.status(403).json({ msg: "Super admin access required" });
    }
    req.superAdmin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};
