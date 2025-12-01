const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const {
  createPO,
  approvePO,
  rejectPOByFoundation,
  vendorAcceptPO,
  vendorRejectPO,
  shipPO,
  confirmDelivery
} = require("../controllers/po.controller");

// Dapur membuat PO
router.post("/create", auth, role("dapur"), createPO);

// Yayasan approve / reject
router.patch("/:id/approve", auth, role("yayasan_admin"), approvePO);
router.patch("/:id/reject", auth, role("yayasan_admin"), rejectPOByFoundation);

// Vendor menerima / menolak PO
router.patch("/:id/vendor/accept", auth, role("vendor"), vendorAcceptPO);
router.patch("/:id/vendor/reject", auth, role("vendor"), vendorRejectPO);

// Vendor kirim barang
router.patch("/:id/ship", auth, role("vendor"), shipPO);

// Dapur konfirmasi barang diterima
router.patch("/:id/confirm", auth, role("dapur"), confirmDelivery);

module.exports = router;
