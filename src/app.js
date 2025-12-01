require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ====== STATIC FRONTEND ======
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// ====== API ROUTES ======
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const ingredientRoutes = require("./routes/ingredient.routes");
const poRoutes = require("./routes/po.routes");
const deliveryRoutes = require("./routes/delivery.routes");

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/ingredients", ingredientRoutes);
app.use("/po", poRoutes);
app.use("/delivery", deliveryRoutes);

// (optional) root path kalau mau selalu kirim index.html
// app.get("*", (req, res) => {
//   res.sendFile(path.join(publicPath, "index.html"));
// });

module.exports = app;
