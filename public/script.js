"use strict";

/* ===== Sidebar (меню) ===== */
function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('active');
}

// Клик вне меню — закрыть
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (!sidebar || !menuBtn) return;
  if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
    sidebar.classList.remove('active');
  }
});

function performSearch() {
  const q = (document.getElementById('sidebar-search')?.value || '').trim();
  if (!q) return alert('Vennligst skriv inn et søkeord');
  alert('Søk: ' + q);
}

/* ===== Modal order form ===== */
const PRODUCTS = {
  "Ananas og mango": {
    gif: "Images/AnanasMangoGif.gif",
    info: "Frisk og tropisk blanding: mango, ananas, eple og pasjonsfrukt.\n250 ml · Uten tilsatt sukker · Kilde til C-vitamin."
  },
  "Blåbær og eple": {
    gif: "Images/BlabaerEpleGif.gif",
    info: "Fyldig smak av blåbær med frisk eple og et hint av solbær.\n250 ml · 1 av 5 om dagen."
  },
  "Bringebær og jordbær": {
    gif: "Images/BringebaerJordbaerGif.gif",
    info: "Søt og bærfrisk: bringebær, jordbær, eple.\nPerfekt som snack eller på farten."
  },
  "Kiwi og eple": {
    gif: "Images/KiwiEpleGif.gif",
    info: "Grønn og frisk miks: kiwi og eple.\nGir deg energi og et friskt kick – uten tilsatt sukker."
  }
};

// Предзагрузка GIF
(function preloadGIFs() {
  Object.values(PRODUCTS).forEach(p => {
    if (p?.gif) {
      const img = new Image();
      img.src = p.gif;
    }
  });
})();

let _twTimer = null;
function typeText(el, text, speed = 18) {
  if (_twTimer) { clearInterval(_twTimer); _twTimer = null; }
  if (!el) return;
  el.textContent = "";
  let i = 0;
  _twTimer = setInterval(() => {
    el.textContent = text.slice(0, i++);
    if (i > text.length) { clearInterval(_twTimer); _twTimer = null; }
  }, speed);
}

/* === GIF mapping for each smoothie === */
const smoothieGifs = {
  "Ananas og mango": "Images/AnanasMangoGif.gif",
  "Blåbær og eple": "Images/BlabaerEpleGif.gif",
  "Bringebær og jordbær": "Images/BringebaerJordbaerGif.gif",
  "Kiwi og eple": "Images/KiwiEpleGif.gif"
};

/* ====== Open / Close Order Form ====== */
function openOrderForm(productName) {
  const modal = document.getElementById("order-modal");
  const title = document.getElementById("order-title");
  const nameInp = document.getElementById("product-name");
  const nameEl = document.getElementById("pour-name");
  const typedEl = document.getElementById("typed-line");
  const gifEl = document.getElementById("pour-gif");

  nameInp.value = productName || "";
  title.textContent = "Bestill produkt";
  nameEl.textContent = productName || "";

  const meta = PRODUCTS[productName] || {};
  const gifPath = smoothieGifs[productName] || meta.gif || "Images/default.gif";
  if (gifEl) gifEl.src = gifPath;

  typeText(typedEl, meta?.info || "Utvalgt smoothie.", 16);

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeOrderForm() {
  const modal = document.getElementById("order-modal");
  const form = document.getElementById("order-form");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  form.reset();
  if (_twTimer) { clearInterval(_twTimer); _twTimer = null; }
}

function submitOrder(e) {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  alert(`Takk! Vi kontakter deg på ${d.email}.\n\nProdukt: ${d.product}\nAntall: ${d.quantity}`);
  closeOrderForm();
}

// Открытие формы при клике на кнопку "Bestill"
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.order-btn');
  if (btn) openOrderForm(btn.dataset.product || btn.textContent.trim() || 'Smoothie');
});

/* ===== Floating custom smoothie form ===== */
function toggleFloatingOrder() {
  document.getElementById('floating-order')?.classList.toggle('collapsed');
}

function submitFloatingOrder(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const d = Object.fromEntries(formData.entries());
  const ingredients = [...formData.getAll("ingredients")].join(", ") || "Ingen ingredienser valgt";

  alert(`Takk for bestillingen din! 🧃
Smoothie: ${d.smoothie}
Ingredienser: ${ingredients}
Antall: ${d.quantity}
E-post: ${d.email}
Kommentar: ${d.comment || "Ingen"}`);

  e.target.reset();
  toggleFloatingOrder();
}

/* ===== Меню: контентные разделы ===== */
function openSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('sidebar')?.classList.remove('active');
}

function closeSections() {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  document.body.style.overflow = 'auto';
}

// Привязка к меню
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelectorAll('.sidebar .nav-item');
  if (nav.length >= 3) {
    nav[0].addEventListener('click', () => openSection('raw-section'));
    nav[1].addEventListener('click', () => openSection('smoothie-section'));
    nav[2].addEventListener('click', () => openSection('about-section'));
  }
});

// Закрытие разделов по Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSections();
    document.getElementById('sidebar')?.classList.remove('active');
  }
});

// Сохраняем последнюю «кастомную» форму (не товары!)
document.getElementById('floating-order-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  localStorage.setItem('lastSmoothie', JSON.stringify(data));
});

/* ===== 3D CAROUSEL ===== */
let currentIndex = 0;
let angleStep = 0;
let radius = 0;
let animating = false;

const scene = document.getElementById('carousel3d');
let cards = [];

function applyCardTransform(card, angleDeg, isActive) {
  const base = `translate(-50%, -50%) rotateY(${angleDeg}deg) translateZ(${radius}px) rotateY(${-angleDeg}deg)`;
  card.style.transform = isActive ? `${base} scale(1.04)` : `${base} scale(0.93)`;
  card.style.opacity = isActive ? '1' : '0.85';
  card.style.zIndex = isActive ? '3' : '1';
  card.classList.toggle('active', !!isActive);
}

function setup3D() {
  if (!scene || !cards.length) return;
  const n = cards.length;
  angleStep = 360 / n;
  const cardW = cards[0].getBoundingClientRect().width;
  const baseRadius = cardW / (2 * Math.tan(Math.PI / n));
  const ringScale = 0.62;
  radius = Math.max(120, Math.round(baseRadius * ringScale));
  scene.style.transform = `translateZ(-${radius}px) rotateX(6deg)`;
  update3D();
}

function update3D() {
  const n = cards.length;
  if (!n) return;
  const rotDeg = -currentIndex * angleStep;
  const active = (((Math.round(-rotDeg / angleStep)) % n) + n) % n;
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep + rotDeg;
    applyCardTransform(cards[i], angle, i === active);
  }
}

function animateTo(delta) {
  if (animating) return;
  animating = true;
  const start = performance.now();
  const duration = 550;
  const startIndex = currentIndex;
  const endIndex = startIndex + delta;

  function frame(t) {
    const p = Math.min(1, (t - start) / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    currentIndex = startIndex + (endIndex - startIndex) * ease;
    update3D();
    if (p < 1) requestAnimationFrame(frame);
    else {
      currentIndex = endIndex;
      animating = false;
      update3D();
    }
  }
  requestAnimationFrame(frame);
}

function carouselNext() { animateTo(+1); }
function carouselPrev() { animateTo(-1); }

/* === ГЛАВНОЕ: грузим товары из БД через API === */
document.addEventListener('DOMContentLoaded', async () => {
  async function fetchProducts() {
  try {
    const res = await fetch(`/api/products?ts=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API error ' + res.status);
    const smoothies = await res.json();
    return Array.isArray(smoothies) ? smoothies : [];
  } catch (err) {
    console.error("❌ Feil ved henting:", err);
    return [];
  }
}


  const smoothies = await fetchProducts();

  const carousel = document.getElementById("carousel3d");
  if (!smoothies.length) {
    carousel.innerHTML = "<p style='text-align:center;color:white;'>Ingen smoothies tilgjengelig</p>";
    return;
  }

  carousel.innerHTML = smoothies.map(item => `
    <div class="card">
      <div class="card-inner">
        <div class="imgbox">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <h3>${item.name}</h3>
        <p>${item.ingredients}</p>
        <button class="order-btn" data-product="${item.name}">Bestill</button>
      </div>
    </div>
  `).join("");

  cards = Array.from(document.querySelectorAll("#carousel3d .card"));
  setup3D();
  update3D();

  document.getElementById("prev3d")?.addEventListener("click", carouselPrev);
  document.getElementById("next3d")?.addEventListener("click", carouselNext);

  document.querySelectorAll(".order-btn").forEach(btn =>
    btn.addEventListener("click", () => openOrderForm(btn.dataset.product))
  );
});

/* ===== Тема (светлая/тёмная) ===== */
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

window.addEventListener('load', () => {
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }
});
