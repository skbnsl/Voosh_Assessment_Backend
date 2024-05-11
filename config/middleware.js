// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  console.log("toke", token);
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, "THiS_IS_a__JWT_sECrET_kEY");
    console.log("decoded", decoded);
    req.userID = decoded.userID;
    console.log(decoded.email);
    console.log(req.email);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { verifyToken };
