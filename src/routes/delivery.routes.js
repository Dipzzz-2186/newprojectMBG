const router = require("express").Router();

router.get("/ping", (req, res) => {
  res.json({ message: "delivery route OK" });
});

module.exports = router;
