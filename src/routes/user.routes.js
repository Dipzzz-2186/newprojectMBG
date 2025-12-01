const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createUser,
  createKitchenUser,
  createVendorUser
} = require("../controllers/user.controller");

// generic create user (kalau mau)
router.post("/create", auth, role("yayasan_admin"), createUser);

// buat akun dapur + profil kitchens
router.post("/create-dapur", auth, role("yayasan_admin"), createKitchenUser);

// buat akun vendor + profil vendors
router.post("/create-vendor", auth, role("yayasan_admin"), createVendorUser);

module.exports = router;
