require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// middleware global
app.use(cors());
app.use(express.json());

// IMPORT ROUTES (PASTIKAN PATHNYA SAMA)
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const ingredientRoutes = require("./routes/ingredient.routes");
const poRoutes = require("./routes/po.routes");
const deliveryRoutes = require("./routes/delivery.routes");

// UNTUK DEBUG: CEK TIPE ROUTE
console.log("authRoutes type:", typeof authRoutes);
console.log("userRoutes type:", typeof userRoutes);
console.log("ingredientRoutes type:", typeof ingredientRoutes);
console.log("poRoutes type:", typeof poRoutes);
console.log("deliveryRoutes type:", typeof deliveryRoutes);

// REGISTER ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/ingredients", ingredientRoutes);
app.use("/po", poRoutes);
app.use("/delivery", deliveryRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MBG Marketplace API OK" });
});

module.exports = app;
