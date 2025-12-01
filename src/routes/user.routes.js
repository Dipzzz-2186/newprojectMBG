const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  createUser,
  createKitchenUser,
  createVendorUser
} = require("../controllers/user.controller");

// hanya yayasan_admin yang boleh manage user
router.post("/create", auth, role("yayasan_admin"), createUser);
router.post("/create-dapur", auth, role("yayasan_admin"), createKitchenUser);
router.post("/create-vendor", auth, role("yayasan_admin"), createVendorUser);

module.exports = router;
