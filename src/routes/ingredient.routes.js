const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  createIngredient,
  listVendorIngredients,
  listAllIngredients
} = require("../controllers/ingredient.controller");

// vendor: tambah bahan & lihat bahan sendiri
router.post("/", auth, role("vendor"), createIngredient);
router.get("/me", auth, role("vendor"), listVendorIngredients);

// yayasan & dapur: lihat semua bahan (marketplace)
router.get("/", auth, role("yayasan_admin", "yayasan_staff", "dapur", "vendor"), listAllIngredients);

module.exports = router;
