const pool = require("../config/db");

// helper: cari vendor_id berdasarkan user login
async function getVendorIdByUser(userId) {
  const [rows] = await pool.query(
    "SELECT id FROM vendors WHERE user_id = ?",
    [userId]
  );
  return rows[0]?.id || null;
}

// vendor menambahkan bahan
exports.createIngredient = async (req, res) => {
  const user = req.user; // role: vendor
  const { name, category, unit, price, stock } = req.body;

  try {
    const vendorId = await getVendorIdByUser(user.id);
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor profile tidak ditemukan" });
    }

    await pool.query(
      "INSERT INTO ingredients (vendor_id, name, category, unit, price, stock, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
      [vendorId, name, category || null, unit, price, stock || 0]
    );

    res.json({ message: "Bahan berhasil ditambahkan" });
  } catch (err) {
    console.error("createIngredient ERROR:", err);
    res.status(500).json({ message: "Gagal menambahkan bahan" });
  }
};

// vendor melihat list bahan miliknya
exports.listVendorIngredients = async (req, res) => {
  const user = req.user;

  try {
    const vendorId = await getVendorIdByUser(user.id);
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor profile tidak ditemukan" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM ingredients WHERE vendor_id = ? AND status = 'active'",
      [vendorId]
    );

    res.json(rows);
  } catch (err) {
    console.error("listVendorIngredients ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data bahan" });
  }
};

// dapur/yayasan melihat semua bahan di marketplace
exports.listAllIngredients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, v.name AS vendor_name
      FROM ingredients i
      JOIN vendors v ON i.vendor_id = v.id
      WHERE i.status = 'active'
    `);

    res.json(rows);
  } catch (err) {
    console.error("listAllIngredients ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data bahan" });
  }
};
