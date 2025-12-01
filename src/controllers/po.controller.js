const pool = require("../config/db");

// =======================================================
// Helper: simpan log perubahan status PO
// =======================================================
async function addStatusLog(poId, from, to, userId, note = null) {
  await pool.query(
    "INSERT INTO order_status_logs (purchase_order_id, from_status, to_status, changed_by, note) VALUES (?, ?, ?, ?, ?)",
    [poId, from, to, userId, note]
  );
}

// =======================================================
// 1. DAPUR MEMBUAT PURCHASE ORDER
// =======================================================
exports.createPO = async (req, res) => {
  const { kitchen_id, needed_date, items } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO purchase_orders (kitchen_id, needed_date, status, foundation_user_id) VALUES (?, ?, 'submitted_to_foundation', NULL)",
      [kitchen_id, needed_date]
    );

    const poId = result.insertId;

    // Insert item PO satu-satu
    for (let item of items) {
      await pool.query(
        "INSERT INTO purchase_order_items (purchase_order_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)",
        [poId, item.ingredient_id, item.quantity, item.unit]
      );
    }

    res.json({ 
      message: "PO berhasil dibuat dan dikirim ke yayasan", 
      poId 
    });

  } catch (err) {
    console.error("createPO ERROR:", err);
    res.status(500).json({ message: "Gagal membuat PO" });
  }
};

// =======================================================
// 2. YAYASAN APPROVE PO → MENERUSKAN KE VENDOR
// =======================================================
exports.approvePO = async (req, res) => {
  const poId = req.params.id;
  const { vendor_id } = req.body;
  const user = req.user; // user yayasan

  try {
    const [[po]] = await pool.query(
      "SELECT status FROM purchase_orders WHERE id=?",
      [poId]
    );

    if (!po) return res.status(404).json({ message: "PO tidak ditemukan" });

    await pool.query(
      "UPDATE purchase_orders SET vendor_id=?, status='sent_to_vendor', foundation_user_id=? WHERE id=?",
      [vendor_id, user.id, poId]
    );

    await addStatusLog(poId, po.status, "sent_to_vendor", user.id);

    res.json({ message: "PO telah diteruskan ke vendor" });

  } catch (err) {
    console.error("approvePO ERROR:", err);
    res.status(500).json({ message: "Gagal approve PO" });
  }
};

// =======================================================
// 3. YAYASAN MENOLAK PO
// =======================================================
exports.rejectPOByFoundation = async (req, res) => {
  const poId = req.params.id;
  const user = req.user; // yayasan

  try {
    const [[po]] = await pool.query(
      "SELECT status FROM purchase_orders WHERE id=?",
      [poId]
    );

    if (!po) return res.status(404).json({ message: "PO tidak ditemukan" });

    await pool.query(
      "UPDATE purchase_orders SET status='rejected_by_foundation' WHERE id=?",
      [poId]
    );

    await addStatusLog(poId, po.status, "rejected_by_foundation", user.id);

    res.json({ message: "PO ditolak oleh yayasan" });

  } catch (err) {
    console.error("rejectPO ERROR:", err);
    res.status(500).json({ message: "Gagal menolak PO" });
  }
};

// =======================================================
// 4. VENDOR MENERIMA PO
// =======================================================
exports.vendorAcceptPO = async (req, res) => {
  const poId = req.params.id;
  const user = req.user; // vendor

  try {
    const [[po]] = await pool.query(
      "SELECT status FROM purchase_orders WHERE id=?",
      [poId]
    );

    if (!po) return res.status(404).json({ message: "PO tidak ditemukan" });

    await pool.query(
      "UPDATE purchase_orders SET status='accepted_by_vendor' WHERE id=?",
      [poId]
    );

    await addStatusLog(poId, po.status, "accepted_by_vendor", user.id);

    res.json({ message: "Vendor menerima PO" });

  } catch (err) {
    console.error("vendorAcceptPO ERROR:", err);
    res.status(500).json({ message: "Gagal menerima PO" });
  }
};

// =======================================================
// 5. VENDOR MENOLAK PO
// =======================================================
exports.vendorRejectPO = async (req, res) => {
  const poId = req.params.id;
  const user = req.user; // vendor
  const { note } = req.body;

  try {
    const [[po]] = await pool.query(
      "SELECT status FROM purchase_orders WHERE id=?",
      [poId]
    );

    if (!po) return res.status(404).json({ message: "PO tidak ditemukan" });

    await pool.query(
      "UPDATE purchase_orders SET status='rejected_by_vendor' WHERE id=?",
      [poId]
    );

    await addStatusLog(poId, po.status, "rejected_by_vendor", user.id, note);

    res.json({ message: "Vendor menolak PO" });

  } catch (err) {
    console.error("vendorRejectPO ERROR:", err);
    res.status(500).json({ message: "Gagal menolak PO" });
  }
};

// =======================================================
// 6. VENDOR MENGIRIM BARANG (SHIPMENT)
// =======================================================
exports.shipPO = async (req, res) => {
  const poId = req.params.id;
  const user = req.user; // vendor

  try {
    const [[po]] = await pool.query(
      "SELECT status FROM purchase_orders WHERE id=?",
      [poId]
    );

    if (!po) return res.status(404).json({ message: "PO tidak ditemukan" });

    await pool.query(
      "UPDATE purchase_orders SET status='shipped' WHERE id=?",
      [poId]
    );

    await addStatusLog(poId, po.status, "shipped", user.id);

    res.json({ message: "Vendor mengirim barang ke dapur" });

  } catch (err) {
    console.error("shipPO ERROR:", err);
    res.status(500).json({ message: "Gagal update shipment" });
  }
};

// =======================================================
// 7. DAPUR KONFIRMASI BARANG DITERIMA
// =======================================================
exports.confirmDelivery = async (req, res) => {
  const poId = req.params.id;
  const user = req.user; // dapur

  try {
    const [[po]] = await pool.query(
      "SELECT status FROM purchase_orders WHERE id=?",
      [poId]
    );

    if (!po) return res.status(404).json({ message: "PO tidak ditemukan" });

    await pool.query(
      "UPDATE purchase_orders SET status='completed' WHERE id=?",
      [poId]
    );

    await addStatusLog(poId, po.status, "completed", user.id);

    res.json({ message: "Pengiriman dikonfirmasi, barang diterima dapur" });

  } catch (err) {
    console.error("confirmDelivery ERROR:", err);
    res.status(500).json({ message: "Gagal konfirmasi penerimaan" });
  }
};
