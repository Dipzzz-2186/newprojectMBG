const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createIngredient,
  listVendorIngredients,
  listAllIngredients
} = require("../controllers/ingredient.controller");

// vendor tambah bahan
router.post("/", auth, role("vendor"), createIngredient);

// vendor lihat bahan miliknya
router.get("/me", auth, role("vendor"), listVendorIngredients);

// dapur, yayasan, vendor boleh lihat semua bahan
router.get("/", auth, role("yayasan_admin", "yayasan_staff", "dapur", "vendor"), listAllIngredients);

module.exports = router;
