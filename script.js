const rooms = [
  {
    id: "1",
    name: "Kamar Single Fan",
    type: "single_fan",
    price: 700000,
    description: "Kamar kost dengan kipas angin, ukuran 3x3 meter",
    image: "assets/images/kamar-single-fan.jpg",
    location: "Jl. Tegalgondo No. 123, Malang",
    rating: 4.2,
    available: true,
  },
  {
    id: "2",
    name: "Kamar Single AC",
    type: "single_ac",
    price: 1200000,
    description: "Kamar kost dengan AC, ukuran 3x4 meter",
    image: "assets/images/kamar-ac.jpg",
    location: "Jl. Tegalgondo No. 123, Malang",
    rating: 4.5,
    available: true,
  },
  {
    id: "3",
    name: "Kamar Deluxe",
    type: "deluxe",
    price: 1800000,
    description: "Kamar kost deluxe dengan kamar mandi dalam",
    image: "assets/images/kamar-deluxe.jpg",
    location: "Jl. Tegalgondo No. 123, Malang",
    rating: 4.8,
    available: true,
  },
];

const services = [
  {
    id: "1",
    name: "Laundry Express",
    description: "Layanan laundry kilat",
    price: 8000,
    unit: "kg",
    icon: "laundry",
  },
  {
    id: "2",
    name: "Buang Sampah Harian",
    description: "Penjemputan sampah",
    price: 50000,
    unit: "bulan",
    icon: "trash",
  },
  {
    id: "3",
    name: "Bersih - Bersih Kamar",
    description: "Pembersihan kamar",
    price: 75000,
    unit: "bulan",
    icon: "cleaning",
  },
];

const typeLabels = {
  single_fan: "SINGLE FAN",
  single_ac: "SINGLE AC",
  deluxe: "DELUXE",
};

const serviceIconText = {
  laundry: "LND",
  trash: "TRH",
  cleaning: "CLN",
};

const state = {
  query: "",
  filter: "all",
  favorites: new Set(),
};

const roomGrid = document.getElementById("roomGrid");
const serviceList = document.getElementById("serviceList");
const searchInput = document.getElementById("searchInput");
const filterChips = document.getElementById("filterChips");
const sideMenu = document.getElementById("sideMenu");
const menuButton = document.getElementById("menuButton");

function formatRupiah(value) {
  return `Rp${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function filteredRooms() {
  const q = state.query.trim().toLowerCase();
  return rooms.filter((room) => {
    const inSearch =
      q.length === 0 ||
      room.name.toLowerCase().includes(q) ||
      room.location.toLowerCase().includes(q) ||
      room.description.toLowerCase().includes(q);

    if (!inSearch) {
      return false;
    }

    if (state.filter === "all") {
      return true;
    }

    if (state.filter === "favorites") {
      return state.favorites.has(room.id);
    }

    return room.type === state.filter;
  });
}

function roomCardTemplate(room, index) {
  const liked = state.favorites.has(room.id);
  const availableClass = room.available ? "ok" : "no";
  const availableLabel = room.available ? "Tersedia" : "Penuh";
  const typeLabel = typeLabels[room.type] || room.type.toUpperCase();

  return `
    <article class="room-card reveal" style="animation-delay:${0.04 + index * 0.05}s">
      <div class="room-media">
        <img src="${room.image}" alt="${room.name}" loading="lazy" />
      </div>
      <div class="room-content">
        <div class="room-topline">
          <span class="room-type ${room.type}">${typeLabel}</span>
          <button type="button" class="fav-btn ${liked ? "active" : ""}" data-room-id="${room.id}">
            ${liked ? "Favorit" : "Simpan"}
          </button>
        </div>
        <h3 class="room-name">${room.name}</h3>
        <p class="room-location">${room.location}</p>
        <p class="room-rate">Rating ${room.rating.toFixed(1)}</p>
        <div class="room-bottom">
          <p class="room-price ${room.type}">${formatRupiah(room.price)}/bulan</p>
          <span class="availability ${availableClass}">${availableLabel}</span>
        </div>
      </div>
    </article>
  `;
}

function renderRooms() {
  const visible = filteredRooms();
  if (visible.length === 0) {
    roomGrid.innerHTML =
      '<div class="room-empty">Tidak ada kamar yang cocok dengan filter atau pencarian.</div>';
    return;
  }

  roomGrid.innerHTML = visible.map(roomCardTemplate).join("");

  roomGrid.querySelectorAll(".fav-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const roomId = button.dataset.roomId;
      if (!roomId) {
        return;
      }

      if (state.favorites.has(roomId)) {
        state.favorites.delete(roomId);
      } else {
        state.favorites.add(roomId);
      }

      renderRooms();
    });
  });
}

function serviceTemplate(service) {
  const iconText = serviceIconText[service.icon] || "SRV";
  return `
    <article class="service-card">
      <div class="service-icon ${service.icon}">${iconText}</div>
      <div class="service-info">
        <h3>${service.name}</h3>
        <p>${service.description}</p>
      </div>
      <div class="service-buy">
        <p class="service-price">${formatRupiah(service.price)}</p>
        <p class="service-unit">/${service.unit}</p>
        <button type="button">Pesan</button>
      </div>
    </article>
  `;
}

function renderServices() {
  serviceList.innerHTML = services.map(serviceTemplate).join("");
}

function activateChip(nextFilter) {
  state.filter = nextFilter;
  filterChips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.filter === nextFilter);
  });
  renderRooms();
}

function bindEvents() {
  searchInput.addEventListener("input", () => {
    state.query = searchInput.value;
    renderRooms();
  });

  filterChips.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const nextFilter = chip.dataset.filter;
      if (nextFilter) {
        activateChip(nextFilter);
      }
    });
  });

  menuButton.addEventListener("click", () => {
    sideMenu.classList.add("open");
    sideMenu.setAttribute("aria-hidden", "false");
  });

  sideMenu.addEventListener("click", (event) => {
    const panel = sideMenu.querySelector(".side-menu__panel");
    if (panel && !panel.contains(event.target)) {
      sideMenu.classList.remove("open");
      sideMenu.setAttribute("aria-hidden", "true");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      sideMenu.classList.remove("open");
      sideMenu.setAttribute("aria-hidden", "true");
    }
  });
}

function init() {
  bindEvents();
  renderRooms();
  renderServices();
}

init();
