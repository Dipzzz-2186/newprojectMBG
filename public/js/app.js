let token = null;
let role = null;

function showSection(id) {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("dashboard-section").style.display = "none";

  const el = document.getElementById(id);
  if (el) el.style.display = "block";
}

function showRolePanel(role) {
  document.querySelectorAll(".role-panel").forEach(p => p.style.display = "none");

  if (role === "yayasan_admin") {
    document.getElementById("yayasan-dashboard").style.display = "block";
  } else if (role === "dapur") {
    document.getElementById("dapur-dashboard").style.display = "block";
  } else if (role === "vendor") {
    document.getElementById("vendor-dashboard").style.display = "block";
  }
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }
  headers["Content-Type"] = "application/json";
  const resp = await fetch(path, {
    ...options,
    headers,
  });
  if (!resp.ok) {
    // simple error handling
    const txt = await resp.text();
    throw new Error(txt || "Request error");
  }
  return resp.json();
}

// ==== LOGIN HANDLER ====
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errEl = document.getElementById("login-error");
  errEl.textContent = "";

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    token = data.token;
    role = data.role;
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    document.getElementById("user-info").textContent = `Logged in as: ${role}`;
    showSection("dashboard-section");
    showRolePanel(role);
  } catch (err) {
    console.error(err);
    errEl.textContent = "Login gagal. Cek email/password.";
  }
});

// ==== LOGOUT ====
document.getElementById("logout-btn").addEventListener("click", () => {
  token = null;
  role = null;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  showSection("login-section");
});

// ==== DAPUR: LOAD INGREDIENTS ====
const btnLoadIngredients = document.getElementById("btn-load-ingredients");
if (btnLoadIngredients) {
  btnLoadIngredients.addEventListener("click", async () => {
    const listEl = document.getElementById("ingredients-list");
    listEl.innerHTML = "Loading...";
    try {
      const items = await apiFetch("/ingredients");
      if (!items.length) {
        listEl.innerHTML = "<p>Tidak ada bahan.</p>";
        return;
      }
      listEl.innerHTML = "<ul>" + items.map(i =>
        `<li>${i.name} (${i.unit}) - Rp${i.price} [Vendor: ${i.vendor_name || ''}] (ID: ${i.id})</li>`
      ).join("") + "</ul>";
    } catch (err) {
      console.error(err);
      listEl.innerHTML = "<p>Gagal load data bahan.</p>";
    }
  });
}

// ==== DAPUR: BUAT PO ====
const poForm = document.getElementById("po-form");
if (poForm) {
  poForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const kitchenId = Number(document.getElementById("po-kitchen-id").value);
    const neededDate = document.getElementById("po-needed-date").value;
    const ingredientId = Number(document.getElementById("po-ingredient-id").value);
    const qty = Number(document.getElementById("po-quantity").value);
    const unit = document.getElementById("po-unit").value;
    const msgEl = document.getElementById("po-message");
    msgEl.textContent = "";

    try {
      const data = await apiFetch("/po/create", {
        method: "POST",
        body: JSON.stringify({
          kitchen_id: kitchenId,
          needed_date: neededDate,
          items: [
            { ingredient_id: ingredientId, quantity: qty, unit }
          ]
        })
      });
      msgEl.textContent = `PO berhasil dibuat dengan ID ${data.poId}`;
    } catch (err) {
      console.error(err);
      msgEl.textContent = "Gagal membuat PO.";
    }
  });
}

// ==== YAYASAN: LOAD PO MASUK (sementara simple) ====
const btnLoadPO = document.getElementById("btn-load-pos");
if (btnLoadPO) {
  btnLoadPO.addEventListener("click", async () => {
    const listEl = document.getElementById("po-list");
    listEl.innerHTML = "<p>Untuk sekarang, endpoint list PO belum dibuat. Nanti bisa ditambah di backend (GET /po)</p>";
  });
}

// ==== AUTO LOGIN DARI LOCALSTORAGE (kalau ada) ====
window.addEventListener("DOMContentLoaded", () => {
  const savedToken = localStorage.getItem("token");
  const savedRole = localStorage.getItem("role");
  if (savedToken && savedRole) {
    token = savedToken;
    role = savedRole;
    document.getElementById("user-info").textContent = `Logged in as: ${role}`;
    showSection("dashboard-section");
    showRolePanel(role);
  } else {
    showSection("login-section");
  }
});
