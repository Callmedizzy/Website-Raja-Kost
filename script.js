const KOSTS = [
  {
    id: "1",
    name: "Kamar Single Fan",
    type: "single_fan",
    price: 700000,
    description: "Kamar kost dengan kipas angin, ukuran 3x3 meter.",
    image: "assets/images/kamar-single-fan.jpg",
    facilities: ["Kasur", "Lemari", "Meja Belajar", "Kipas Angin"],
    location: "Jl. Tegalgondo No. 123, Malang",
    rating: 4.2,
    available: true,
  },
  {
    id: "2",
    name: "Kamar Single AC",
    type: "single_ac",
    price: 1200000,
    description: "Kamar kost dengan AC, ukuran 3x4 meter.",
    image: "assets/images/kamar-ac.jpg",
    facilities: ["Kasur", "Lemari", "Meja Belajar", "AC", "TV"],
    location: "Jl. Tegalgondo No. 123, Malang",
    rating: 4.5,
    available: true,
  },
  {
    id: "3",
    name: "Kamar Deluxe",
    type: "deluxe",
    price: 1800000,
    description: "Kamar kost deluxe dengan kamar mandi dalam.",
    image: "assets/images/kamar-deluxe.jpg",
    facilities: ["Kasur", "Lemari", "Meja Belajar", "AC", "TV", "Kamar Mandi Dalam"],
    location: "Jl. Tegalgondo No. 123, Malang",
    rating: 4.8,
    available: true,
  },
];

const SERVICES = [
  {
    id: "1",
    name: "Laundry Express",
    description: "Layanan laundry kilat",
    price: 8000,
    unit: "kg",
    icon: "laundry",
    category: "laundry",
  },
  {
    id: "2",
    name: "Buang Sampah Harian",
    description: "Penjemputan sampah",
    price: 50000,
    unit: "bulan",
    icon: "trash",
    category: "cleaning",
  },
  {
    id: "3",
    name: "Bersih - Bersih Kamar",
    description: "Pembersihan kamar",
    price: 75000,
    unit: "bulan",
    icon: "cleaning",
    category: "cleaning",
  },
];

const ROOM_CODES_BY_TYPE = {
  single_fan: ["1C", "2C", "3C", "4C", "5C"],
  single_ac: ["1B", "2B", "3B", "4B", "5B"],
  deluxe: ["1A", "2A", "3A"],
};

const TYPE_LABEL = {
  single_fan: "Single Fan",
  single_ac: "Single AC",
  deluxe: "Deluxe",
};

const TYPE_UPPER = {
  single_fan: "SINGLE FAN",
  single_ac: "SINGLE AC",
  deluxe: "DELUXE",
};

const SERVICE_ICON_TEXT = {
  laundry: "LND",
  trash: "TRH",
  cleaning: "CLN",
};

const ROUTES = new Set([
  "/home",
  "/login",
  "/register",
  "/detail",
  "/payment",
  "/history",
  "/wishlist",
  "/settings",
  "/help",
  "/report",
  "/admin",
  "/admin/reports",
  "/location-lab",
  "/chat",
  "/admin/chats",
]);

const STORAGE_KEY = "rk_web_state_v3";

let store = loadStore();

const appState = {
  homeSearch: "",
  homeFilter: "all",
  paymentQty: 1,
  paymentMethod: "qris",
  paymentSignature: "",
  adminRoomType: "single_fan",
  adminNewRoom: false,
  adminHistoryRoom: "all",
  adminReportFilter: "all",
  loginError: "",
  registerError: "",
  redirectAfterLogin: null,
  picker: {
    open: false,
    serviceId: "",
    type: "single_fan",
    code: "",
  },
};

const sideMenu = document.getElementById("sideMenu");
const menuEmail = document.getElementById("menuEmail");
const menuList = document.getElementById("menuList");
const appView = document.getElementById("appView");
const toastWrap = document.getElementById("toastWrap");

const roomPicker = document.getElementById("roomPicker");
const pickerTypeChips = document.getElementById("pickerTypeChips");
const pickerCodeChips = document.getElementById("pickerCodeChips");
const pickerCancel = document.getElementById("pickerCancel");
const pickerConfirm = document.getElementById("pickerConfirm");

function createDefaultStore() {
  const rooms = [];
  Object.entries(ROOM_CODES_BY_TYPE).forEach(([type, codes]) => {
    codes.forEach((code) => {
      rooms.push({
        id: uid("room"),
        code,
        type,
        is_available: true,
      });
    });
  });

  return {
    users: [
      {
        id: "admin_1",
        email: "admin@rajakost.com",
        password: "admin123",
        role: "admin",
        created_at: "2025-01-01T10:00:00.000Z",
      },
      {
        id: "user_1",
        email: "user@rajakost.com",
        password: "user123",
        role: "user",
        created_at: "2025-01-01T10:30:00.000Z",
      },
    ],
    session_user_id: null,
    favorites_by_user: {},
    bookings: [],
    reports: [],
    rooms,
    room_assignments: [],
    chats: {
      threads: [],
      messages: [],
    },
  };
}

function loadStore() {
  const fallback = createDefaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    const merged = {
      ...fallback,
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : fallback.users,
      favorites_by_user:
        parsed.favorites_by_user && typeof parsed.favorites_by_user === "object"
          ? parsed.favorites_by_user
          : {},
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      rooms: Array.isArray(parsed.rooms) && parsed.rooms.length > 0 ? parsed.rooms : fallback.rooms,
      room_assignments: Array.isArray(parsed.room_assignments) ? parsed.room_assignments : [],
      chats:
        parsed.chats &&
        typeof parsed.chats === "object" &&
        Array.isArray(parsed.chats.threads) &&
        Array.isArray(parsed.chats.messages)
          ? parsed.chats
          : fallback.chats,
    };

    if (!merged.users.some((u) => u.email === "admin@rajakost.com")) {
      merged.users.push(fallback.users[0]);
    }
    return merged;
  } catch (_) {
    return fallback;
  }
}

function saveStore() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRupiah(value) {
  return `Rp${Number(value || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "-";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${h}:${min}`;
}

function parseHash() {
  let raw = window.location.hash.slice(1);
  if (!raw) {
    raw = "/home";
  }
  if (!raw.startsWith("/")) {
    raw = `/${raw}`;
  }
  const [pathPart, queryPart = ""] = raw.split("?");
  const params = Object.fromEntries(new URLSearchParams(queryPart).entries());
  return { path: pathPart || "/home", params, raw };
}

function buildHash(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const q = query.toString();
  return q ? `#${path}?${q}` : `#${path}`;
}

function go(path, params = {}, replace = false) {
  const target = buildHash(path, params);
  if (replace) {
    const base = window.location.href.split("#")[0];
    window.location.replace(`${base}${target}`);
  } else {
    window.location.hash = target;
  }
}

function currentUser() {
  return store.users.find((u) => u.id === store.session_user_id) || null;
}

function isAdmin(user) {
  return Boolean(user && user.role === "admin");
}

function favoriteOwnerKey() {
  const user = currentUser();
  return user ? user.id : "guest";
}

function favoriteSet() {
  const key = favoriteOwnerKey();
  const list = store.favorites_by_user[key] || [];
  return new Set(list);
}

function saveFavoriteSet(set) {
  const key = favoriteOwnerKey();
  store.favorites_by_user[key] = Array.from(set);
  saveStore();
}

function getKost(id) {
  return KOSTS.find((item) => item.id === String(id)) || null;
}

function getService(id) {
  return SERVICES.find((item) => item.id === String(id)) || null;
}

function getRoomRowsByType(type) {
  return store.rooms
    .filter((room) => room.type === type)
    .sort((a, b) => a.code.localeCompare(b.code));
}

function guardPath(path, params) {
  const user = currentUser();
  const authOnly = new Set(["/history", "/report", "/chat"]);
  const adminOnly = new Set(["/admin", "/admin/reports", "/admin/chats"]);

  if (adminOnly.has(path) && !isAdmin(user)) {
    toast("Akses ditolak. Halaman ini untuk admin.");
    return { path: "/home", params: {} };
  }

  if (authOnly.has(path) && !user) {
    appState.redirectAfterLogin = `${path}${Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : ""}`;
    toast("Silakan login terlebih dahulu.");
    return { path: "/login", params: {} };
  }

  if ((path === "/login" || path === "/register") && user) {
    return { path: "/home", params: {} };
  }

  return { path, params };
}

function renderApp() {
  const parsed = parseHash();
  const requestedPath = ROUTES.has(parsed.path) ? parsed.path : "/home";
  const guarded = guardPath(requestedPath, parsed.params);
  if (guarded.path !== requestedPath) {
    go(guarded.path, guarded.params, true);
    return;
  }

  updateSideMenu();

  if (requestedPath === "/home") {
    appView.innerHTML = renderHomePage();
  } else if (requestedPath === "/wishlist") {
    appView.innerHTML = renderWishlistPage();
  } else if (requestedPath === "/detail") {
    appView.innerHTML = renderDetailPage(parsed.params);
  } else if (requestedPath === "/payment") {
    appView.innerHTML = renderPaymentPage(parsed.params);
  } else if (requestedPath === "/login") {
    appView.innerHTML = renderLoginPage();
  } else if (requestedPath === "/register") {
    appView.innerHTML = renderRegisterPage();
  } else if (requestedPath === "/history") {
    appView.innerHTML = renderHistoryPage();
  } else if (requestedPath === "/settings") {
    appView.innerHTML = renderSettingsPage();
  } else if (requestedPath === "/help") {
    appView.innerHTML = renderHelpPage();
  } else if (requestedPath === "/report") {
    appView.innerHTML = renderReportPage();
  } else if (requestedPath === "/admin") {
    appView.innerHTML = renderAdminPage();
  } else if (requestedPath === "/admin/reports") {
    appView.innerHTML = renderAdminReportsPage();
  } else if (requestedPath === "/location-lab") {
    appView.innerHTML = renderLocationLabPage();
  } else if (requestedPath === "/chat") {
    appView.innerHTML = renderChatPage(parsed.params);
    scrollChatToBottom();
  } else if (requestedPath === "/admin/chats") {
    appView.innerHTML = renderAdminChatsPage();
  } else {
    appView.innerHTML = renderHomePage();
  }
}

function renderAppBar({
  title,
  subtitle = "",
  showMenu = true,
  showBackButton = false,
  showChatButton = false,
  showCrown = false,
  badge = 0,
}) {
  const left = `
    <div class="bar-side">
      ${showMenu ? '<button type="button" class="icon-btn menu" data-action="open-menu" aria-label="Menu"><span></span><span></span><span></span></button>' : ""}
      ${showBackButton ? '<button type="button" class="icon-btn back" data-action="go-back" aria-label="Kembali"></button>' : ""}
      ${!showMenu && !showBackButton ? '<span class="bar-placeholder"></span>' : ""}
    </div>
  `;

  const right = `
    <div class="bar-side right">
      ${
        showChatButton
          ? `<button type="button" class="icon-btn chat" data-action="chat-shortcut" aria-label="Chat">
               <span class="dot"></span>
               ${badge > 0 ? `<strong class="chat-badge">${badge}</strong>` : ""}
             </button>`
          : '<span class="bar-placeholder"></span>'
      }
    </div>
  `;

  return `
    <header class="appbar">
      ${left}
      <div class="appbar-title">
        <h1>
          ${escapeHtml(title)}
          ${showCrown ? '<img src="assets/icon/crown.png" alt="" aria-hidden="true" />' : ""}
        </h1>
        ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
      </div>
      ${right}
    </header>
  `;
}

function renderHomePage() {
  const favs = favoriteSet();
  const q = appState.homeSearch.trim().toLowerCase();
  const rooms = KOSTS.filter((room) => {
    const inSearch =
      q.length === 0 ||
      room.name.toLowerCase().includes(q) ||
      room.location.toLowerCase().includes(q);
    if (!inSearch) return false;
    if (appState.homeFilter === "all") return true;
    if (appState.homeFilter === "favorites") return favs.has(room.id);
    return room.type === appState.homeFilter;
  });

  return `
    <section class="page">
      ${renderAppBar({
        title: "Raja Kost",
        subtitle: "Kost Impian Anak UMM",
        showMenu: true,
        showBackButton: false,
        showChatButton: true,
        showCrown: true,
      })}
      <section class="top-gap">
        <label class="search">
          <input id="homeSearch" type="search" placeholder="Cari kost..." value="${escapeHtml(
            appState.homeSearch
          )}" />
        </label>
      </section>
      <section class="block">
        <div class="block-head">
          <h2>Kamar</h2>
        </div>
        <div class="chips">
          ${renderHomeFilterChip("all", "Semua")}
          ${renderHomeFilterChip("single_fan", "Single Fan")}
          ${renderHomeFilterChip("single_ac", "Single AC")}
          ${renderHomeFilterChip("deluxe", "Deluxe")}
          ${renderHomeFilterChip("favorites", "Favorit")}
        </div>
        <div class="room-grid">
          ${
            rooms.length
              ? rooms.map((room) => renderRoomCard(room, favs.has(room.id))).join("")
              : '<div class="empty">Tidak ada kamar yang cocok dengan filter atau pencarian.</div>'
          }
        </div>
      </section>
      <section class="block">
        <div class="block-head">
          <h2>Layanan Tambahan</h2>
        </div>
        <div class="service-list">
          ${SERVICES.map((service) => renderServiceCard(service)).join("")}
        </div>
      </section>
    </section>
  `;
}

function renderHomeFilterChip(value, label) {
  const active = appState.homeFilter === value ? "active" : "";
  return `<button type="button" class="chip ${active}" data-action="set-home-filter" data-filter="${value}">${label}</button>`;
}

function renderRoomCard(room, liked) {
  return `
    <article class="room-card" data-action="open-detail" data-room-id="${room.id}">
      <div class="room-media">
        <img src="${room.image}" alt="${escapeHtml(room.name)}" loading="lazy" />
      </div>
      <div class="room-content">
        <div class="room-topline">
          <span class="room-type ${room.type}">${TYPE_UPPER[room.type] || room.type.toUpperCase()}</span>
          <button type="button" class="fav-btn ${liked ? "active" : ""}" data-action="toggle-favorite" data-room-id="${
            room.id
          }">${liked ? "Favorit" : "Simpan"}</button>
        </div>
        <h3 class="room-name">${escapeHtml(room.name)}</h3>
        <p class="room-location">${escapeHtml(room.location)}</p>
        <p class="room-rate">Rating ${room.rating.toFixed(1)}</p>
        <div class="room-bottom">
          <p class="room-price ${room.type}">${formatRupiah(room.price)}/bulan</p>
          <span class="availability ${room.available ? "ok" : "no"}">${room.available ? "Tersedia" : "Penuh"}</span>
        </div>
      </div>
    </article>
  `;
}

function renderServiceCard(service) {
  const iconClass = ["laundry", "trash", "cleaning"].includes(service.icon) ? service.icon : "misc";
  const iconText = SERVICE_ICON_TEXT[service.icon] || "SRV";
  return `
    <article class="service-card">
      <div class="service-icon ${iconClass}">${iconText}</div>
      <div class="service-info">
        <h3>${escapeHtml(service.name)}</h3>
        <p>${escapeHtml(service.description)}</p>
      </div>
      <div class="service-buy">
        <p class="service-price">${formatRupiah(service.price)}</p>
        <p class="service-unit">/${escapeHtml(service.unit)}</p>
        <button type="button" class="btn muted" data-action="open-room-picker" data-service-id="${service.id}">Pesan</button>
      </div>
    </article>
  `;
}

function renderWishlistPage() {
  const favs = favoriteSet();
  const favorites = KOSTS.filter((room) => favs.has(room.id));
  return `
    <section class="page">
      ${renderAppBar({
        title: "Wishlist",
        subtitle: "Kost favoritmu",
        showMenu: true,
        showBackButton: true,
        showChatButton: false,
      })}
      <section class="block">
        <div class="room-grid">
          ${
            favorites.length
              ? favorites.map((room) => renderRoomCard(room, true)).join("")
              : '<div class="empty">Belum ada kost di wishlist. Tap ikon favorit di halaman home.</div>'
          }
        </div>
      </section>
    </section>
  `;
}

function renderDetailPage(params) {
  const roomId = params.room || "1";
  const room = getKost(roomId);
  if (!room) {
    return `
      <section class="page">
        ${renderAppBar({
          title: "Detail",
          showMenu: true,
          showBackButton: true,
        })}
        <section class="panel">
          <div class="empty">Data kamar tidak ditemukan.</div>
        </section>
      </section>
    `;
  }

  const rows = getRoomRowsByType(room.type);
  const statusRows = rows.length
    ? rows
    : ROOM_CODES_BY_TYPE[room.type].map((code) => ({
        code,
        is_available: room.available,
      }));
  const anyAvailable = statusRows.some((row) => row.is_available);

  return `
    <section class="page">
      ${renderAppBar({
        title: "Detail Kamar",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="hero-image">
        <img src="${room.image}" alt="${escapeHtml(room.name)}" />
      </section>
      <section class="panel">
        <div class="row-between">
          <h3>${escapeHtml(room.name)}</h3>
          <span class="type-badge ${room.type}">${TYPE_UPPER[room.type] || room.type}</span>
        </div>
        <p class="detail-price">${formatRupiah(room.price)}/bulan</p>
        <p class="detail-meta">Lokasi: ${escapeHtml(room.location)}</p>
        <p class="detail-meta">Rating: ${room.rating.toFixed(1)} (120 ulasan)</p>
      </section>
      <section class="panel">
        <h3>Deskripsi</h3>
        <p class="subtle">${escapeHtml(room.description)}</p>
      </section>
      <section class="panel">
        <h3>Fasilitas</h3>
        <div class="facility-wrap">
          ${room.facilities.map((item) => `<span class="facility-pill">${escapeHtml(item)}</span>`).join("")}
        </div>
      </section>
      <section class="panel">
        <h3>Status kamar (${TYPE_LABEL[room.type]})</h3>
        <p class="subtle">${anyAvailable ? "Ada yang tersedia" : "Semua penuh"}</p>
        <div class="room-status">
          ${statusRows
            .map(
              (row) =>
                `<span class="${row.is_available ? "ok" : "no"}">${escapeHtml(row.code)} ${row.is_available ? "Tersedia" : "Penuh"}</span>`
            )
            .join("")}
        </div>
        <div class="btn-row">
          <button type="button" class="btn primary" data-action="book-from-detail" data-room-id="${room.id}">Pesan Sekarang</button>
        </div>
      </section>
    </section>
  `;
}

function paymentContextFromParams(params) {
  if (params.kind === "service") {
    const service = getService(params.serviceId);
    if (!service) return null;
    return {
      service,
      roomType: params.roomType || null,
      roomCode: params.roomCode || null,
    };
  }
  if (params.kind === "room") {
    const room = getKost(params.roomId);
    if (!room) return null;
    return {
      service: {
        id: `kost_${room.id}`,
        name: `Sewa ${room.name}`,
        description: `Sewa kamar kost tipe ${room.type}`,
        price: room.price,
        unit: "bulan",
        icon: "room",
        category: "room",
      },
      roomType: params.roomType || room.type,
      roomCode: params.roomCode || null,
    };
  }
  return null;
}

function renderPaymentPage(params) {
  const ctx = paymentContextFromParams(params);
  if (!ctx) {
    return `
      <section class="page">
        ${renderAppBar({
          title: "Pembayaran",
          showMenu: true,
          showBackButton: true,
        })}
        <section class="panel">
          <div class="empty">Data pembayaran tidak valid. Buka kembali dari halaman Home atau Detail.</div>
        </section>
      </section>
    `;
  }

  const signature = JSON.stringify({
    serviceId: ctx.service.id,
    roomType: ctx.roomType || "",
    roomCode: ctx.roomCode || "",
  });
  if (signature !== appState.paymentSignature) {
    appState.paymentSignature = signature;
    appState.paymentQty = 1;
    appState.paymentMethod = "qris";
  }

  const isLaundry =
    ctx.service.icon === "laundry" ||
    String(ctx.service.unit).toLowerCase() === "kg" ||
    ctx.service.category === "laundry";
  const maxUnits = isLaundry ? 50 : 12;
  appState.paymentQty = Math.min(Math.max(appState.paymentQty, 1), maxUnits);

  const total = ctx.service.price * appState.paymentQty;
  const discountPct = !isLaundry && appState.paymentQty >= 12 ? 0.1 : 0;
  const discount = total * discountPct;
  const finalPrice = total - discount;
  const user = currentUser();

  return `
    <section class="page">
      ${renderAppBar({
        title: ctx.service.category === "room" ? "Pembayaran Kamar" : "Pembayaran Layanan",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="panel">
        <div class="row-between">
          <h3>${escapeHtml(ctx.service.name)}</h3>
          <span class="type-badge ${ctx.roomType || "single_ac"}">${ctx.service.category === "room" ? "ROOM" : "LAYANAN"}</span>
        </div>
        <p class="subtle">${escapeHtml(ctx.service.description)}</p>
        ${
          ctx.roomType || ctx.roomCode
            ? `<p class="pill-info">${ctx.roomType ? escapeHtml(TYPE_LABEL[ctx.roomType] || ctx.roomType) : ""} ${
                ctx.roomCode ? `| Kamar ${escapeHtml(ctx.roomCode)}` : ""
              }</p>`
            : ""
        }
      </section>
      <section class="panel">
        <h3>Akun</h3>
        <p class="subtle">${user ? escapeHtml(user.email) : "Belum login"}</p>
        <div class="field">
          <label>Metode Pembayaran</label>
          <div class="methods">
            <button type="button" class="method-chip ${appState.paymentMethod === "qris" ? "active" : ""}" data-action="set-payment-method" data-method="qris">QRIS</button>
            <button type="button" class="method-chip ${appState.paymentMethod === "bni" ? "active" : ""}" data-action="set-payment-method" data-method="bni">BNI</button>
          </div>
        </div>
      </section>
      <section class="panel">
        <h3>${isLaundry ? "Pilih Jumlah Cucian" : "Pilih Durasi Pembayaran"}</h3>
        <div class="row-between top-gap">
          <p class="subtle">Jumlah ${isLaundry ? "KG" : "Bulan"} (1-${maxUnits})</p>
          <div class="qty-control">
            <button type="button" class="qty-btn" data-action="payment-qty-minus">-</button>
            <span class="qty-value">${appState.paymentQty}</span>
            <button type="button" class="qty-btn" data-action="payment-qty-plus">+</button>
          </div>
        </div>
        <div class="progress"><span style="width:${(appState.paymentQty / maxUnits) * 100}%"></span></div>
      </section>
      <section class="panel">
        <h3>Rincian Pembayaran</h3>
        <div class="kv">
          <div class="kv-row"><span>Harga ${isLaundry ? "per KG" : "per Bulan"}</span><strong>${formatRupiah(ctx.service.price)}</strong></div>
          <div class="kv-row"><span>Jumlah ${isLaundry ? "KG" : "Bulan"}</span><strong>${appState.paymentQty}x</strong></div>
          <div class="kv-row"><span>Subtotal</span><strong>${formatRupiah(total)}</strong></div>
          ${
            discountPct > 0
              ? `<div class="kv-row"><span>Diskon (${Math.round(discountPct * 100)}%)</span><strong class="danger-text">-${formatRupiah(discount)}</strong></div>`
              : ""
          }
          <div class="kv-row total"><span>Total Pembayaran</span><strong>${formatRupiah(finalPrice)}</strong></div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn primary" data-action="submit-payment">Bayar Sekarang</button>
        </div>
      </section>
    </section>
  `;
}

function renderLoginPage() {
  return `
    <section class="page">
      ${renderAppBar({
        title: "Login",
        showMenu: false,
        showBackButton: true,
      })}
      <form class="form-card" data-form="login">
        <h2>Masuk ke Raja Kost</h2>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" required />
        </div>
        ${appState.loginError ? `<p class="danger-text subtle">${escapeHtml(appState.loginError)}</p>` : ""}
        <div class="btn-row">
          <button type="submit" class="btn primary">Login</button>
        </div>
        <button type="button" class="text-link" data-action="go-route" data-route="/register">Belum punya akun? Daftar di sini</button>
      </form>
    </section>
  `;
}

function renderRegisterPage() {
  return `
    <section class="page">
      ${renderAppBar({
        title: "Register",
        showMenu: false,
        showBackButton: true,
      })}
      <form class="form-card" data-form="register">
        <h2>Buat akun baru</h2>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" required />
        </div>
        ${appState.registerError ? `<p class="danger-text subtle">${escapeHtml(appState.registerError)}</p>` : ""}
        <div class="btn-row">
          <button type="submit" class="btn primary">Daftar</button>
        </div>
        <button type="button" class="text-link" data-action="go-route" data-route="/login">Sudah punya akun? Login di sini</button>
      </form>
    </section>
  `;
}

function renderHistoryPage() {
  const user = currentUser();
  const bookings = store.bookings
    .filter((item) => item.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return `
    <section class="page">
      ${renderAppBar({
        title: "Riwayat Pesanan",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="block">
        ${
          bookings.length
            ? `<div class="tile-list">${bookings
                .map(
                  (booking) => `
                    <article class="tile">
                      <div class="row-between">
                        <h4>${escapeHtml(booking.service_name)}</h4>
                        <strong>${formatRupiah(booking.final_price)}</strong>
                      </div>
                      <p class="meta">Dibuat: ${formatDate(booking.created_at)}</p>
                      ${
                        booking.room_type || booking.room_code
                          ? `<p>Tipe: ${escapeHtml(booking.room_type || "-")} | Kamar: ${escapeHtml(booking.room_code || "-")}</p>`
                          : ""
                      }
                      <p>Jumlah: ${escapeHtml(booking.quantity)}</p>
                      <div class="btn-row">
                        <button type="button" class="btn warn" data-action="cancel-booking" data-booking-id="${
                          booking.id
                        }">Batalkan</button>
                      </div>
                    </article>
                  `
                )
                .join("")}</div>`
            : '<div class="empty">Belum ada pesanan.</div>'
        }
      </section>
    </section>
  `;
}

function renderSettingsPage() {
  const user = currentUser();
  return `
    <section class="page">
      ${renderAppBar({
        title: "Pengaturan",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="panel-stack">
        <section class="panel">
          <h3>Akun</h3>
          <p class="subtle">Email</p>
          <p>${escapeHtml(user?.email || "Belum login")}</p>
          <div class="btn-row">
            ${
              user
                ? '<button type="button" class="btn ghost" data-action="logout">Logout</button>'
                : '<button type="button" class="btn primary" data-action="go-route" data-route="/login">Login</button>'
            }
            <button type="button" class="btn warn" data-action="delete-account">Hapus Akun</button>
          </div>
        </section>
        <section class="panel">
          <h3>Lainnya</h3>
          <div class="btn-row">
            <button type="button" class="btn muted" data-action="go-route" data-route="/location-lab">Eksperimen Lokasi</button>
            <button type="button" class="btn muted" data-action="go-route" data-route="/help">Bantuan & Tentang</button>
          </div>
        </section>
      </section>
    </section>
  `;
}

function renderHelpPage() {
  return `
    <section class="page">
      ${renderAppBar({
        title: "Bantuan & Tentang",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="panel-stack">
        <section class="panel">
          <h3>FAQ Singkat</h3>
          <p class="subtle"><strong>Bagaimana cara memesan kost?</strong><br />Pilih kost atau layanan, tentukan jumlah/durasi, lalu lanjutkan pembayaran.</p>
          <p class="subtle"><strong>Apakah data saya aman?</strong><br />Data disimpan secara lokal di browser ini untuk demo website.</p>
        </section>
        <section class="panel">
          <h3>Kontak Admin</h3>
          <p class="subtle">Email: admin@rajakost.com</p>
          <p class="subtle">WhatsApp: +62 811-456-999</p>
        </section>
        <section class="panel">
          <h3>Tentang Aplikasi</h3>
          <p class="subtle">Raja Kost versi web demo, mengikuti alur Flutter app (login, booking, report, admin, chat).</p>
        </section>
      </section>
    </section>
  `;
}

function userReports() {
  const user = currentUser();
  if (!user) return [];
  return store.reports
    .filter((report) => report.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function renderReportPage() {
  const reports = userReports();
  return `
    <section class="page">
      ${renderAppBar({
        title: "Laporan",
        showMenu: true,
        showBackButton: true,
      })}
      <form class="form-card" data-form="report">
        <h2>Kirim Laporan</h2>
        <div class="field">
          <label>Subjek</label>
          <input type="text" name="subject" required />
        </div>
        <div class="field">
          <label>Kategori (opsional)</label>
          <input type="text" name="category" />
        </div>
        <div class="field">
          <label>Pesan</label>
          <textarea name="message" required></textarea>
        </div>
        <div class="btn-row">
          <button type="submit" class="btn primary">Kirim Laporan</button>
        </div>
      </form>
      <section class="block">
        <div class="block-head"><h2>Riwayat Laporan Saya</h2></div>
        ${
          reports.length
            ? `<div class="tile-list">${reports
                .map(
                  (report) => `
                <article class="tile">
                  <div class="row-between">
                    <h4>${escapeHtml(report.subject)}</h4>
                    <span class="status-badge ${escapeHtml(report.status)}">${escapeHtml(report.status)}</span>
                  </div>
                  ${report.category ? `<p>Kategori: ${escapeHtml(report.category)}</p>` : ""}
                  <p>${escapeHtml(report.message)}</p>
                  <p class="meta">Dibuat: ${formatDate(report.created_at)}</p>
                  ${report.admin_note ? `<p class="meta">Catatan admin: ${escapeHtml(report.admin_note)}</p>` : ""}
                  <div class="btn-row">
                    <button type="button" class="btn muted" data-action="edit-report" data-report-id="${report.id}">Edit</button>
                    <button type="button" class="btn warn" data-action="delete-report" data-report-id="${report.id}">Hapus</button>
                  </div>
                </article>
              `
                )
                .join("")}</div>`
            : '<div class="empty">Belum ada laporan.</div>'
        }
      </section>
    </section>
  `;
}

function groupedRooms() {
  const groups = {
    single_fan: [],
    single_ac: [],
    deluxe: [],
    lainnya: [],
  };
  store.rooms.forEach((room) => {
    if (groups[room.type]) {
      groups[room.type].push(room);
    } else {
      groups.lainnya.push(room);
    }
  });
  Object.keys(groups).forEach((key) => {
    groups[key] = groups[key].sort((a, b) => a.code.localeCompare(b.code));
  });
  return groups;
}

function adminHistoryRows() {
  const usersById = Object.fromEntries(store.users.map((user) => [user.id, user]));
  const assignmentsByRoom = {};
  [...store.room_assignments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .forEach((assignment) => {
      if (!assignmentsByRoom[assignment.room_code]) {
        assignmentsByRoom[assignment.room_code] = assignment.user_email;
      }
    });

  return store.bookings
    .map((booking) => {
      const roomCode = booking.room_code || "-";
      return {
        id: booking.id,
        room_code: roomCode,
        room_type: booking.room_type || "",
        service_name: booking.service_name || "-",
        final_price: booking.final_price || 0,
        created_at: booking.created_at,
        is_room_booking: String(booking.service_id || "").startsWith("kost_"),
        assigned_email: assignmentsByRoom[roomCode] || "",
        user_email: usersById[booking.user_id]?.email || "",
      };
    })
    .filter((row) => {
      if (appState.adminHistoryRoom === "all") return true;
      return row.room_code === appState.adminHistoryRoom;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function renderAdminPage() {
  const grouped = groupedRooms();
  const typedRows = store.rooms
    .filter((row) => row.type === appState.adminRoomType)
    .sort((a, b) => a.code.localeCompare(b.code));
  const history = adminHistoryRows();

  return `
    <section class="page">
      ${renderAppBar({
        title: "Admin",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="panel-stack">
        <section class="panel">
          <h3>Kamar</h3>
          <p class="subtle">Tambah dan ubah ketersediaan kamar.</p>
          <form class="top-gap" data-form="admin-room">
            <div class="field">
              <label>Pilih tipe kamar</label>
              <select name="type" data-action="admin-room-type">
                ${Object.entries(TYPE_LABEL)
                  .map(
                    ([value, label]) =>
                      `<option value="${value}" ${appState.adminRoomType === value ? "selected" : ""}>${label}</option>`
                  )
                  .join("")}
              </select>
            </div>
            <div class="field">
              <label>Pilih kode kamar</label>
              <select name="existingCode" ${appState.adminNewRoom ? "disabled" : ""}>
                <option value="">-- pilih --</option>
                ${typedRows.map((row) => `<option value="${row.code}">${row.code}</option>`).join("")}
              </select>
            </div>
            <label class="check-row">
              <input type="checkbox" name="newRoom" data-action="admin-room-new" ${appState.adminNewRoom ? "checked" : ""} />
              Kamar baru (kode belum ada)
            </label>
            ${
              appState.adminNewRoom
                ? `<div class="field">
                    <label>Kode baru</label>
                    <input type="text" name="newCode" placeholder="mis. 5C" />
                  </div>`
                : ""
            }
            <label class="check-row">
              <input type="checkbox" name="available" checked />
              Tersedia
            </label>
            <div class="btn-row">
              <button type="submit" class="btn primary">Simpan status</button>
            </div>
          </form>
          <div class="panel-stack">
            ${renderAdminRoomGroup("single_fan", grouped.single_fan)}
            ${renderAdminRoomGroup("single_ac", grouped.single_ac)}
            ${renderAdminRoomGroup("deluxe", grouped.deluxe)}
            ${grouped.lainnya.length ? renderAdminRoomGroup("lainnya", grouped.lainnya) : ""}
          </div>
        </section>

        <section class="panel">
          <h3>Penugasan Email -> Kamar</h3>
          <p class="subtle">Catat email penghuni dan kamar yang ditempati.</p>
          <form class="top-gap" data-form="admin-assignment">
            <div class="field">
              <label>Email pengguna</label>
              <input type="email" name="email" required />
            </div>
            <div class="field">
              <label>Kode kamar</label>
              <input type="text" name="roomCode" required />
            </div>
            <div class="field">
              <label>Catatan (opsional)</label>
              <textarea name="note"></textarea>
            </div>
            <div class="btn-row">
              <button type="submit" class="btn primary">Simpan penugasan</button>
            </div>
          </form>
          <div class="tile-list">
            ${
              store.room_assignments.length
                ? [...store.room_assignments]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(
                      (assignment) => `
                      <article class="tile">
                        <h4>${escapeHtml(assignment.user_email)}</h4>
                        <p>Kamar: ${escapeHtml(assignment.room_code)}</p>
                        ${assignment.note ? `<p>Catatan: ${escapeHtml(assignment.note)}</p>` : ""}
                        <div class="btn-row">
                          <button type="button" class="btn warn" data-action="delete-assignment" data-assignment-id="${
                            assignment.id
                          }">Hapus</button>
                        </div>
                      </article>
                    `
                    )
                    .join("")
                : '<div class="empty">Belum ada penugasan.</div>'
            }
          </div>
        </section>

        <section class="panel">
          <h3>Riwayat per Kamar</h3>
          <p class="subtle">Lihat transaksi berdasarkan kamar dan layanan.</p>
          <div class="field">
            <label>Pilih kamar</label>
            <select data-action="admin-history-filter">
              <option value="all" ${appState.adminHistoryRoom === "all" ? "selected" : ""}>Semua kamar</option>
              ${store.rooms
                .sort((a, b) => a.code.localeCompare(b.code))
                .map(
                  (room) =>
                    `<option value="${room.code}" ${appState.adminHistoryRoom === room.code ? "selected" : ""}>${room.code}</option>`
                )
                .join("")}
            </select>
          </div>
          <div class="tile-list">
            ${
              history.length
                ? history
                    .map(
                      (row) => `
                      <article class="tile">
                        <div class="row-between">
                          <h4>Kamar: ${escapeHtml(row.room_code)}</h4>
                          <strong>${formatRupiah(row.final_price)}</strong>
                        </div>
                        <p>${escapeHtml(row.service_name)}</p>
                        <p class="meta">${row.is_room_booking ? "Booking kamar" : "Layanan"}${
                          row.room_type ? ` | Tipe: ${escapeHtml(row.room_type)}` : ""
                        }</p>
                        <p class="meta">Email: ${escapeHtml(row.assigned_email || row.user_email || "Belum dicatat")}</p>
                        <p class="meta">Dibuat: ${formatDate(row.created_at)}</p>
                      </article>
                    `
                    )
                    .join("")
                : '<div class="empty">Belum ada riwayat untuk filter ini.</div>'
            }
          </div>
        </section>
      </section>
    </section>
  `;
}

function renderAdminRoomGroup(label, rows) {
  return `
    <section>
      <p class="mini-head">Tipe: ${label === "lainnya" ? "Lainnya" : TYPE_LABEL[label]}</p>
      <div class="tile-list">
        ${
          rows.length
            ? rows
                .map(
                  (row) => `
                  <article class="tile">
                    <div class="row-between">
                      <h4>${escapeHtml(row.code)}</h4>
                      <div class="check-row">
                        <label class="check-row">
                          <input type="checkbox" data-action="toggle-room-availability" data-room-id="${row.id}" ${
                            row.is_available ? "checked" : ""
                          } />
                          ${row.is_available ? "Tersedia" : "Penuh"}
                        </label>
                      </div>
                    </div>
                    <p>${escapeHtml(row.type || "-")}</p>
                    <div class="btn-row">
                      <button type="button" class="btn warn" data-action="delete-room" data-room-id="${row.id}">Hapus</button>
                    </div>
                  </article>
                `
                )
                .join("")
            : '<div class="empty">Belum ada data kamar.</div>'
        }
      </div>
    </section>
  `;
}

function renderAdminReportsPage() {
  const reports = [...store.reports]
    .filter((report) => (appState.adminReportFilter === "all" ? true : report.status === appState.adminReportFilter))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return `
    <section class="page">
      ${renderAppBar({
        title: "Laporan Pengguna",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="block">
        <div class="chips">
          ${renderAdminFilterChip("all", "Semua")}
          ${renderAdminFilterChip("open", "Open")}
          ${renderAdminFilterChip("resolved", "Resolved")}
          ${renderAdminFilterChip("closed", "Closed")}
        </div>
        ${
          reports.length
            ? `<div class="tile-list">${reports
                .map(
                  (report) => `
                  <article class="tile">
                    <div class="row-between">
                      <h4>${escapeHtml(report.subject)}</h4>
                      <span class="status-badge ${escapeHtml(report.status)}">${escapeHtml(report.status)}</span>
                    </div>
                    <p>${escapeHtml(report.message)}</p>
                    <p class="meta">Email: ${escapeHtml(report.user_email || "-")}</p>
                    <p class="meta">Dibuat: ${formatDate(report.created_at)}</p>
                    ${report.category ? `<p class="meta">Kategori: ${escapeHtml(report.category)}</p>` : ""}
                    ${report.admin_note ? `<p class="meta">Catatan admin: ${escapeHtml(report.admin_note)}</p>` : ""}
                    <div class="btn-row">
                      <button type="button" class="btn muted" data-action="set-report-status" data-report-id="${
                        report.id
                      }" data-status="open">Open</button>
                      <button type="button" class="btn muted" data-action="set-report-status" data-report-id="${
                        report.id
                      }" data-status="resolved">Resolved</button>
                      <button type="button" class="btn warn" data-action="set-report-status" data-report-id="${
                        report.id
                      }" data-status="closed">Closed</button>
                    </div>
                  </article>
                `
                )
                .join("")}</div>`
            : '<div class="empty">Belum ada laporan untuk filter ini.</div>'
        }
      </section>
    </section>
  `;
}

function renderAdminFilterChip(value, label) {
  const active = appState.adminReportFilter === value ? "active" : "";
  return `<button type="button" class="chip ${active}" data-action="set-admin-report-filter" data-status="${value}">${label}</button>`;
}

function renderLocationLabPage() {
  return `
    <section class="page">
      ${renderAppBar({
        title: "Eksperimen Lokasi",
        subtitle: "Bandingkan GPS vs Network",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="panel-stack">
        <section class="panel">
          <h3>Mode Eksperimen</h3>
          <p class="subtle">Halaman web ini menyiapkan placeholder untuk fitur eksperimen lokasi seperti di Flutter app.</p>
          <div class="tile-list">
            <article class="tile"><h4>Statis Outdoor</h4><p>Bandingkan akurasi GPS vs Network di area terbuka.</p></article>
            <article class="tile"><h4>Statis Indoor</h4><p>Uji stabilitas posisi di dalam ruangan.</p></article>
            <article class="tile"><h4>Dinamis (Live)</h4><p>Log posisi saat bergerak dengan interval 1 detik.</p></article>
          </div>
        </section>
      </section>
    </section>
  `;
}

function ensureThreadForUser(userId) {
  let thread = store.chats.threads.find((item) => item.user_id === userId);
  if (!thread) {
    thread = {
      id: uid("chat"),
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    store.chats.threads.push(thread);
    saveStore();
  }
  return thread;
}

function getThreadById(chatId) {
  return store.chats.threads.find((thread) => thread.id === chatId) || null;
}

function getThreadMessages(chatId) {
  return store.chats.messages
    .filter((message) => message.chat_id === chatId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

function markMessagesAsRead(chatId, currentUserId) {
  let changed = false;
  store.chats.messages.forEach((message) => {
    if (message.chat_id === chatId && message.sender_id !== currentUserId && !message.is_read) {
      message.is_read = true;
      changed = true;
    }
  });
  if (changed) saveStore();
}

function unreadCount(chatId, currentUserId) {
  return store.chats.messages.filter(
    (message) => message.chat_id === chatId && message.sender_id !== currentUserId && !message.is_read
  ).length;
}

function renderChatPage(params) {
  const user = currentUser();
  let thread = null;

  if (isAdmin(user) && params.chatId) {
    thread = getThreadById(params.chatId);
  }
  if (!thread) {
    thread = ensureThreadForUser(user.id);
  }

  markMessagesAsRead(thread.id, user.id);
  const messages = getThreadMessages(thread.id);
  const unread = unreadCount(thread.id, user.id);

  return `
    <section class="page">
      ${renderAppBar({
        title: "Chat dengan Admin",
        showMenu: true,
        showBackButton: true,
        showChatButton: false,
        badge: unread,
      })}
      <section class="chat-box">
        <div class="chat-log" id="chatLog">
          ${
            messages.length
              ? messages
                  .map(
                    (message) => `
                    <div class="msg ${message.sender_id === user.id ? "me" : "other"}">
                      ${escapeHtml(message.text)}
                    </div>
                  `
                  )
                  .join("")
              : '<div class="empty">Belum ada pesan</div>'
          }
        </div>
        <form class="chat-input" data-form="chat-send" data-chat-id="${thread.id}">
          <input type="text" name="text" placeholder="Tulis pesan..." autocomplete="off" />
          <button type="submit">Kirim</button>
        </form>
      </section>
    </section>
  `;
}

function renderAdminChatsPage() {
  const user = currentUser();
  const threads = [...store.chats.threads].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return `
    <section class="page">
      ${renderAppBar({
        title: "Chat User",
        showMenu: true,
        showBackButton: true,
      })}
      <section class="block">
        ${
          threads.length
            ? `<div class="tile-list">${threads
                .map((thread) => {
                  const threadUser = store.users.find((item) => item.id === thread.user_id);
                  const unread = unreadCount(thread.id, user.id);
                  return `
                    <article class="tile">
                      <div class="row-between">
                        <h4>${escapeHtml(threadUser?.email || `User ${thread.user_id.slice(0, 8)}`)}</h4>
                        ${unread > 0 ? `<span class="status-badge closed">${unread}</span>` : ""}
                      </div>
                      <p class="meta">${formatDate(thread.created_at)}</p>
                      <div class="btn-row">
                        <button type="button" class="btn primary" data-action="open-admin-chat-thread" data-chat-id="${
                          thread.id
                        }">Buka Chat</button>
                      </div>
                    </article>
                  `;
                })
                .join("")}</div>`
            : '<div class="empty">Belum ada chat.</div>'
        }
      </section>
    </section>
  `;
}

function updateSideMenu() {
  const user = currentUser();
  menuEmail.textContent = user?.email || "Belum login";

  const items = [];
  if (isAdmin(user)) {
    items.push({ label: "Admin", action: "menu-go", route: "/admin" });
    items.push({ label: "Laporan", action: "menu-go", route: "/report" });
    items.push({ label: "Chat User", action: "menu-go", route: "/admin/chats" });
    items.push({ label: "Laporan Admin", action: "menu-go", route: "/admin/reports" });
  } else {
    items.push({ label: "Laporan", action: "menu-go", route: "/report" });
    items.push({ label: "Chat Admin", action: "menu-go", route: "/chat" });
  }
  items.push({ label: "Wishlist", action: "menu-go", route: "/wishlist" });
  items.push({ label: "Riwayat Booking", action: "menu-go", route: "/history" });
  items.push({ label: "Pengaturan", action: "menu-go", route: "/settings" });
  items.push({ label: "Bantuan & Tentang", action: "menu-go", route: "/help" });
  items.push({
    label: user ? "Logout" : "Login",
    action: user ? "logout" : "menu-go",
    route: user ? "" : "/login",
    danger: user,
  });

  menuList.innerHTML = items
    .map(
      (item) => `
      <button type="button" class="${item.danger ? "danger" : ""}" data-action="${item.action}" data-route="${
        item.route || ""
      }">${escapeHtml(item.label)}</button>
    `
    )
    .join("");
}

function openMenu() {
  sideMenu.classList.add("open");
  sideMenu.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  sideMenu.classList.remove("open");
  sideMenu.setAttribute("aria-hidden", "true");
}

function openPicker(serviceId, initialType) {
  appState.picker.open = true;
  appState.picker.serviceId = serviceId;
  appState.picker.type = ["single_fan", "single_ac", "deluxe"].includes(initialType)
    ? initialType
    : "single_fan";
  appState.picker.code = "";
  renderPickerChips();
  roomPicker.classList.add("open");
  roomPicker.setAttribute("aria-hidden", "false");
}

function closePicker() {
  appState.picker.open = false;
  roomPicker.classList.remove("open");
  roomPicker.setAttribute("aria-hidden", "true");
}

function renderPickerChips() {
  const types = ["single_fan", "single_ac", "deluxe"];
  pickerTypeChips.innerHTML = types
    .map((type) => {
      const active = appState.picker.type === type ? "active" : "";
      return `<button type="button" class="chip ${active}" data-action="set-picker-type" data-type="${type}">${
        TYPE_LABEL[type]
      }</button>`;
    })
    .join("");

  const codes = ROOM_CODES_BY_TYPE[appState.picker.type] || [];
  pickerCodeChips.innerHTML = codes
    .map((code) => {
      const active = appState.picker.code === code ? "active" : "";
      return `<button type="button" class="chip ${active}" data-action="set-picker-code" data-code="${code}">${code}</button>`;
    })
    .join("");
  pickerConfirm.disabled = !appState.picker.code;
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  toastWrap.appendChild(node);
  window.setTimeout(() => {
    node.remove();
  }, 2800);
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    go("/home");
  }
}

function chatShortcut() {
  const user = currentUser();
  if (isAdmin(user)) {
    go("/admin/chats");
    return;
  }
  if (!user) {
    appState.redirectAfterLogin = "/chat";
    go("/login");
    return;
  }
  go("/chat");
}

function handlePaymentSubmit() {
  const parsed = parseHash();
  const ctx = paymentContextFromParams(parsed.params);
  if (!ctx) {
    toast("Data pembayaran tidak valid.");
    return;
  }
  const user = currentUser();
  if (!user) {
    appState.redirectAfterLogin = parsed.raw;
    toast("Login diperlukan sebelum pembayaran.");
    go("/login");
    return;
  }

  const isLaundry =
    ctx.service.icon === "laundry" ||
    String(ctx.service.unit).toLowerCase() === "kg" ||
    ctx.service.category === "laundry";
  const discountPct = !isLaundry && appState.paymentQty >= 12 ? 0.1 : 0;
  const total = ctx.service.price * appState.paymentQty;
  const discount = total * discountPct;
  const finalPrice = total - discount;

  store.bookings.push({
    id: uid("booking"),
    created_at: new Date().toISOString(),
    user_id: user.id,
    service_id: ctx.service.id,
    service_name: ctx.service.name,
    room_type: ctx.roomType || null,
    room_code: ctx.roomCode || null,
    quantity: appState.paymentQty,
    price_per_unit: ctx.service.price,
    total_price: total,
    discount,
    final_price: finalPrice,
  });

  if (ctx.service.category === "room" && ctx.roomType && ctx.roomCode) {
    const row = store.rooms.find((room) => room.type === ctx.roomType && room.code === ctx.roomCode);
    if (row) {
      row.is_available = false;
    }
  }

  saveStore();
  toast(`Booking ${ctx.service.name} berhasil disimpan.`);
  go("/history");
}

function handleDeleteAccount() {
  const user = currentUser();
  if (!user) {
    toast("Silakan login dulu untuk menghapus akun.");
    go("/login");
    return;
  }
  const ok = window.confirm("Hapus akun? Transaksi, laporan, dan chat Anda akan dihapus.");
  if (!ok) return;

  const userId = user.id;
  store.bookings = store.bookings.filter((item) => item.user_id !== userId);
  store.reports = store.reports.filter((item) => item.user_id !== userId);
  delete store.favorites_by_user[userId];

  const removedThreads = new Set(
    store.chats.threads.filter((thread) => thread.user_id === userId).map((thread) => thread.id)
  );
  store.chats.threads = store.chats.threads.filter((thread) => thread.user_id !== userId);
  store.chats.messages = store.chats.messages.filter((message) => !removedThreads.has(message.chat_id));

  store.users = store.users.filter((item) => item.id !== userId);
  store.session_user_id = null;
  saveStore();
  toast("Akun berhasil dihapus.");
  go("/home");
}

function scrollChatToBottom() {
  const log = document.getElementById("chatLog");
  if (log) {
    log.scrollTop = log.scrollHeight;
  }
}

function onClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;

  if (action === "open-menu") {
    openMenu();
    return;
  }

  if (action === "go-back") {
    goBack();
    return;
  }

  if (action === "chat-shortcut") {
    chatShortcut();
    return;
  }

  if (action === "go-route") {
    const route = target.dataset.route || "/home";
    go(route);
    return;
  }

  if (action === "set-home-filter") {
    appState.homeFilter = target.dataset.filter || "all";
    renderApp();
    return;
  }

  if (action === "toggle-favorite") {
    event.stopPropagation();
    const roomId = target.dataset.roomId;
    if (!roomId) return;
    const set = favoriteSet();
    if (set.has(roomId)) set.delete(roomId);
    else set.add(roomId);
    saveFavoriteSet(set);
    renderApp();
    return;
  }

  if (action === "open-detail") {
    const roomId = target.dataset.roomId || target.closest("[data-room-id]")?.dataset.roomId;
    if (roomId) go("/detail", { room: roomId });
    return;
  }

  if (action === "open-room-picker") {
    const serviceId = target.dataset.serviceId;
    const initialType = ["single_fan", "single_ac", "deluxe"].includes(appState.homeFilter)
      ? appState.homeFilter
      : "single_fan";
    if (serviceId) openPicker(serviceId, initialType);
    return;
  }

  if (action === "book-from-detail") {
    const roomId = target.dataset.roomId;
    const room = getKost(roomId);
    if (!room) return;
    go("/payment", {
      kind: "room",
      roomId: room.id,
      roomType: room.type,
    });
    return;
  }

  if (action === "set-payment-method") {
    appState.paymentMethod = target.dataset.method || "qris";
    renderApp();
    return;
  }

  if (action === "payment-qty-minus") {
    appState.paymentQty = Math.max(1, appState.paymentQty - 1);
    renderApp();
    return;
  }

  if (action === "payment-qty-plus") {
    const parsed = parseHash();
    const ctx = paymentContextFromParams(parsed.params);
    if (!ctx) return;
    const isLaundry =
      ctx.service.icon === "laundry" ||
      String(ctx.service.unit).toLowerCase() === "kg" ||
      ctx.service.category === "laundry";
    const maxUnits = isLaundry ? 50 : 12;
    appState.paymentQty = Math.min(maxUnits, appState.paymentQty + 1);
    renderApp();
    return;
  }

  if (action === "submit-payment") {
    handlePaymentSubmit();
    return;
  }

  if (action === "cancel-booking") {
    const bookingId = target.dataset.bookingId;
    if (!bookingId) return;
    const ok = window.confirm("Batalkan pesanan ini?");
    if (!ok) return;
    store.bookings = store.bookings.filter((item) => item.id !== bookingId);
    saveStore();
    toast("Pesanan berhasil dibatalkan.");
    renderApp();
    return;
  }

  if (action === "logout") {
    const confirmed = window.confirm("Logout dari akun saat ini?");
    if (!confirmed) return;
    store.session_user_id = null;
    saveStore();
    closeMenu();
    toast("Berhasil logout.");
    go("/home");
    return;
  }

  if (action === "delete-account") {
    handleDeleteAccount();
    return;
  }

  if (action === "menu-go") {
    closeMenu();
    const route = target.dataset.route || "/home";
    go(route);
    return;
  }

  if (action === "edit-report") {
    const reportId = target.dataset.reportId;
    const report = store.reports.find((item) => item.id === reportId);
    if (!report) return;
    const subject = window.prompt("Subjek", report.subject);
    if (subject === null || subject.trim() === "") return;
    const category = window.prompt("Kategori (opsional)", report.category || "");
    if (category === null) return;
    const message = window.prompt("Pesan", report.message);
    if (message === null || message.trim() === "") return;
    report.subject = subject.trim();
    report.category = category.trim();
    report.message = message.trim();
    saveStore();
    toast("Laporan diperbarui.");
    renderApp();
    return;
  }

  if (action === "delete-report") {
    const reportId = target.dataset.reportId;
    const ok = window.confirm("Hapus laporan ini?");
    if (!ok) return;
    store.reports = store.reports.filter((item) => item.id !== reportId);
    saveStore();
    toast("Laporan dihapus.");
    renderApp();
    return;
  }

  if (action === "set-admin-report-filter") {
    appState.adminReportFilter = target.dataset.status || "all";
    renderApp();
    return;
  }

  if (action === "set-report-status") {
    const reportId = target.dataset.reportId;
    const status = target.dataset.status;
    const report = store.reports.find((item) => item.id === reportId);
    if (!report || !status) return;
    report.status = status;
    saveStore();
    toast("Status laporan diperbarui.");
    renderApp();
    return;
  }

  if (action === "toggle-room-availability") {
    const roomId = target.dataset.roomId;
    const room = store.rooms.find((item) => item.id === roomId);
    if (!room) return;
    room.is_available = target.checked;
    saveStore();
    renderApp();
    return;
  }

  if (action === "delete-room") {
    const roomId = target.dataset.roomId;
    const ok = window.confirm("Hapus kamar ini?");
    if (!ok) return;
    store.rooms = store.rooms.filter((item) => item.id !== roomId);
    saveStore();
    toast("Kamar dihapus.");
    renderApp();
    return;
  }

  if (action === "delete-assignment") {
    const assignmentId = target.dataset.assignmentId;
    store.room_assignments = store.room_assignments.filter((item) => item.id !== assignmentId);
    saveStore();
    toast("Penugasan dihapus.");
    renderApp();
    return;
  }

  if (action === "open-admin-chat-thread") {
    const chatId = target.dataset.chatId;
    if (chatId) {
      go("/chat", { chatId });
    }
    return;
  }

  if (action === "set-picker-type") {
    const type = target.dataset.type;
    if (!type) return;
    appState.picker.type = type;
    appState.picker.code = "";
    renderPickerChips();
    return;
  }

  if (action === "set-picker-code") {
    const code = target.dataset.code;
    if (!code) return;
    appState.picker.code = code;
    renderPickerChips();
  }
}

function onInput(event) {
  if (event.target.id === "homeSearch") {
    const cursor = event.target.selectionStart ?? event.target.value.length;
    appState.homeSearch = event.target.value;
    renderApp();
    const input = document.getElementById("homeSearch");
    if (input) {
      input.focus();
      input.setSelectionRange(cursor, cursor);
    }
  }
}

function onChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;

  if (action === "admin-room-type") {
    appState.adminRoomType = target.value;
    renderApp();
    return;
  }
  if (action === "admin-room-new") {
    appState.adminNewRoom = target.checked;
    renderApp();
    return;
  }
  if (action === "admin-history-filter") {
    appState.adminHistoryRoom = target.value || "all";
    renderApp();
  }
}

function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  const formType = form.dataset.form;
  if (!formType) return;

  event.preventDefault();

  if (formType === "login") {
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    const user = store.users.find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) {
      appState.loginError = "Email atau password tidak valid.";
      renderApp();
      return;
    }
    appState.loginError = "";
    appState.registerError = "";
    store.session_user_id = user.id;
    saveStore();
    toast(`Selamat datang, ${user.email}`);
    const parsed = parseHash();
    const nextParam = parsed.params.next;
    const redirect = nextParam || appState.redirectAfterLogin || "/home";
    appState.redirectAfterLogin = null;
    if (redirect.startsWith("/")) {
      const [path, query = ""] = redirect.split("?");
      go(path, Object.fromEntries(new URLSearchParams(query).entries()));
    } else {
      go("/home");
    }
    return;
  }

  if (formType === "register") {
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    if (!email || !password) {
      appState.registerError = "Email dan password wajib diisi.";
      renderApp();
      return;
    }
    if (store.users.some((item) => item.email.toLowerCase() === email)) {
      appState.registerError = "Email sudah terdaftar.";
      renderApp();
      return;
    }
    const role = email === "admin@rajakost.com" ? "admin" : "user";
    const newUser = {
      id: uid("user"),
      email,
      password,
      role,
      created_at: new Date().toISOString(),
    };
    store.users.push(newUser);
    store.session_user_id = newUser.id;
    saveStore();
    appState.registerError = "";
    appState.loginError = "";
    toast("Registrasi berhasil.");
    go("/home");
    return;
  }

  if (formType === "report") {
    const user = currentUser();
    if (!user) {
      toast("Silakan login untuk kirim laporan.");
      go("/login");
      return;
    }
    const formData = new FormData(form);
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const category = String(formData.get("category") || "").trim();
    if (!subject || !message) {
      toast("Isi subjek dan pesan laporan.");
      return;
    }
    store.reports.push({
      id: uid("report"),
      created_at: new Date().toISOString(),
      subject,
      message,
      status: "open",
      user_id: user.id,
      user_email: user.email,
      category: category || null,
      admin_note: "",
    });
    saveStore();
    form.reset();
    toast("Laporan terkirim.");
    renderApp();
    return;
  }

  if (formType === "admin-room") {
    const formData = new FormData(form);
    const type = String(formData.get("type") || "").trim();
    const isNewRoom = Boolean(formData.get("newRoom"));
    const existingCode = String(formData.get("existingCode") || "").trim();
    const newCode = String(formData.get("newCode") || "").trim().toUpperCase();
    const code = (isNewRoom ? newCode : existingCode).trim().toUpperCase();
    const available = Boolean(formData.get("available"));

    if (!type || !code) {
      toast("Pilih tipe dan kode kamar.");
      return;
    }

    const existing = store.rooms.find((room) => room.code.toLowerCase() === code.toLowerCase());
    if (existing) {
      existing.type = type;
      existing.is_available = available;
    } else {
      store.rooms.push({
        id: uid("room"),
        code,
        type,
        is_available: available,
      });
    }
    saveStore();
    appState.adminNewRoom = false;
    toast("Status kamar berhasil disimpan.");
    renderApp();
    return;
  }

  if (formType === "admin-assignment") {
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const roomCode = String(formData.get("roomCode") || "").trim().toUpperCase();
    const note = String(formData.get("note") || "").trim();
    if (!email || !roomCode) {
      toast("Isi email dan kode kamar.");
      return;
    }
    store.room_assignments.push({
      id: uid("assign"),
      user_email: email,
      room_code: roomCode,
      note,
      created_at: new Date().toISOString(),
    });
    saveStore();
    form.reset();
    toast("Penugasan tersimpan.");
    renderApp();
    return;
  }

  if (formType === "chat-send") {
    const user = currentUser();
    if (!user) return;
    const chatId = form.dataset.chatId;
    if (!chatId) return;
    const formData = new FormData(form);
    const text = String(formData.get("text") || "").trim();
    if (!text) return;
    store.chats.messages.push({
      id: uid("msg"),
      chat_id: chatId,
      sender_id: user.id,
      text,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    saveStore();
    form.reset();
    renderApp();
  }
}

function initMenuAndPicker() {
  sideMenu.addEventListener("click", (event) => {
    const panel = sideMenu.querySelector(".side-menu__panel");
    if (panel && !panel.contains(event.target)) {
      closeMenu();
    }
  });

  pickerCancel.addEventListener("click", () => {
    closePicker();
  });

  pickerConfirm.addEventListener("click", () => {
    if (!appState.picker.serviceId || !appState.picker.code) return;
    closePicker();
    go("/payment", {
      kind: "service",
      serviceId: appState.picker.serviceId,
      roomType: appState.picker.type,
      roomCode: appState.picker.code,
    });
  });

  roomPicker.addEventListener("click", (event) => {
    const panel = roomPicker.querySelector(".picker-panel");
    if (panel && !panel.contains(event.target)) {
      closePicker();
    }
  });
}

function boot() {
  if (!window.location.hash) {
    window.location.hash = "#/home";
  }

  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  document.addEventListener("change", onChange);
  document.addEventListener("submit", onSubmit);
  window.addEventListener("hashchange", renderApp);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closePicker();
    }
  });

  initMenuAndPicker();
  renderApp();
}

boot();
