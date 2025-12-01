const bcrypt = require("bcryptjs");
const pool = require("../config/db");

// generic create (kalau mau manual)
exports.createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)",
      [name, email, hash, role, phone || null]
    );

    res.json({ message: "User dibuat" });
  } catch (err) {
    console.error("createUser ERROR:", err);
    res.status(500).json({ message: "Gagal membuat user" });
  }
};

// khusus: buat user dapur + entry di tabel kitchens
exports.createKitchenUser = async (req, res) => {
  const { name, email, password, phone, kitchen_name, kitchen_address } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, 'dapur', ?)",
      [name, email, hash, phone || null]
    );

    const userId = result.insertId;

    await pool.query(
      "INSERT INTO kitchens (user_id, name, address) VALUES (?, ?, ?)",
      [userId, kitchen_name || name, kitchen_address || null]
    );

    res.json({ message: "User dapur & profil kitchen dibuat", userId });
  } catch (err) {
    console.error("createKitchenUser ERROR:", err);
    res.status(500).json({ message: "Gagal membuat user dapur" });
  }
};

// khusus: buat user vendor + entry di tabel vendors
exports.createVendorUser = async (req, res) => {
  const { name, email, password, phone, vendor_name, vendor_address } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, 'vendor', ?)",
      [name, email, hash, phone || null]
    );

    const userId = result.insertId;

    await pool.query(
      "INSERT INTO vendors (user_id, name, address) VALUES (?, ?, ?)",
      [userId, vendor_name || name, vendor_address || null]
    );

    res.json({ message: "User vendor & profil vendor dibuat", userId });
  } catch (err) {
    console.error("createVendorUser ERROR:", err);
    res.status(500).json({ message: "Gagal membuat user vendor" });
  }
};
