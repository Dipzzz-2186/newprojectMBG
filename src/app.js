require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
app.use("/auth", require("./routes/auth.routes"));
app.use("/users", require("./routes/user.routes"));
app.use("/ingredients", require("./routes/ingredient.routes"));
app.use("/po", require("./routes/po.routes"));
app.use("/delivery", require("./routes/delivery.routes"));

module.exports = app;
