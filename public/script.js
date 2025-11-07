"use strict";

/* ================== ХЕЛПЕРЫ ================== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ================== SIDEBAR ================== */
function toggleMenu() {
  const sidebar = $('#sidebar');
  if (sidebar) sidebar.classList.toggle('active');
}

// Клик вне меню — закрыть
document.addEventListener('click', (e) => {
  const sidebar = $('#sidebar');
  const menuBtn = $('#menuBtn');
  if (!sidebar || !menuBtn) return;
  if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
    sidebar.classList.remove('active');
  }
});

// Поиск в сайдбаре
function performSearch() {
  const q = ($('#sidebar-search')?.value || '').trim();
  if (!q) return alert('Vennligst skriv inn et søkeord');
  alert('Søk: ' + q);
}

/* =========== МОДАЛКА (оформление заказа) =========== */
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
(() => {
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

/* === GIF mapping (fallback) === */
const smoothieGifs = {
  "Ananas og mango": "Images/AnanasMangoGif.gif",
  "Blåbær og eple": "Images/BlabaerEpleGif.gif",
  "Bringebær og jordbær": "Images/BringebaerJordbaerGif.gif",
  "Kiwi og eple": "Images/KiwiEpleGif.gif"
};

function openOrderForm(productName) {
  const modal   = $("#order-modal");
  const title   = $("#order-title");
  const nameInp = $("#product-name");
  const nameEl  = $("#pour-name");
  const typedEl = $("#typed-line");
  const gifEl   = $("#pour-gif");

  if (!modal) return;

  if (nameInp) nameInp.value = productName || "";
  if (title)   title.textContent = "Bestill produkt";
  if (nameEl)  nameEl.textContent = productName || "";

  const meta    = PRODUCTS[productName] || {};
  const gifPath = smoothieGifs[productName] || meta.gif || "Images/default.gif";
  if (gifEl) gifEl.src = gifPath;

  typeText(typedEl, meta?.info || "Utvalgt smoothie.", 16);

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
window.openOrderForm = openOrderForm; // нужно для динамических кнопок

function closeOrderForm() {
  const modal = $("#order-modal");
  const form  = $("#order-form");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
  form?.reset();
  if (_twTimer) { clearInterval(_twTimer); _twTimer = null; }
}

/* Отправка заказа (модалка) */
window.submitOrder = function (e) {
  e.preventDefault();
  const form = e.target;
  const d = Object.fromEntries(new FormData(form).entries());
  if (!d.product || !d.name || !d.email || !d.phone || !d.quantity || !d.address) {
    alert('Vennligst fyll ut alle feltene!');
    return;
  }

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: null,
      product: d.product,
      name: d.name,
      email: d.email,
      phone: d.phone,
      quantity: Number(d.quantity || 1),
      address: d.address,
      comments: d.comments || ''
    })
  })
  .then(async (r) => {
    let j = {};
    try { j = await r.json(); } catch {}
    if (!r.ok || !j.id) throw new Error(j.error || 'Order error');
    alert(`Takk! Bestilling #${j.id} registrert. Vi kontakter deg på ${j.email}.`);
    closeOrderForm();
  })
  .catch(() => alert('Kunne ikke sende bestillingen.'));
};

/* ===== Плавающая форма (custom smoothie) ===== */
function toggleFloatingOrder() {
  $('#floating-order')?.classList.toggle('collapsed');
}
window.toggleFloatingOrder = toggleFloatingOrder;

window.submitFloatingOrder = function (e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const d = Object.fromEntries(formData.entries());
  const ingredients = [...formData.getAll("ingredients")].join(", ");

  if (!d.smoothie || !d.email || !d.quantity) {
    alert('Vennligst fyll ut feltene (navn, e-post, antall).');
    return;
  }

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: null,
      product: d.smoothie + (ingredients ? ` (${ingredients})` : ''),
      name: 'Custom order',
      email: d.email,
      phone: 'N/A',
      quantity: Number(d.quantity || 1),
      address: 'Custom smoothie',
      comments: d.comment || ''
    })
  })
  .then(async (r) => {
    let j = {};
    try { j = await r.json(); } catch {}
    if (!r.ok || !j.id) throw new Error(j.error || 'Order error');
    alert(`Takk! Bestilling #${j.id} registrert. Vi sender bekreftelse til ${j.email}.`);
    e.target.reset();
    toggleFloatingOrder();
  })
  .catch(() => alert('Kunne ikke sende bestillingen.'));
};

/* ===== Контентные разделы (overlay) ===== */
function openSection(id) {
  $$('.content-section').forEach(sec => sec.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  document.body.style.overflow = 'hidden';
  $('#sidebar')?.classList.remove('active');
}
function closeSections() {
  $$('.content-section').forEach(sec => sec.classList.remove('active'));
  document.body.style.overflow = 'auto';
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('light-mode') ? 'light' : 'dark'
  );
}
window.toggleTheme = toggleTheme;

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

/* ========== ИНИЦИАЛИЗАЦИЯ ========== */
document.addEventListener('DOMContentLoaded', async () => {
  // Кнопки сайдбара/темы/поиска
  $('.close-btn')?.addEventListener('click', toggleMenu);
  $('#menuBtn')?.addEventListener('click', toggleMenu);
  $('.search-btn')?.addEventListener('click', performSearch);
  $('#themeToggle')?.addEventListener('click', () => toggleTheme());

  // Навигация в сайдбаре
  const nav = $$('.sidebar .nav-item');
  if (nav.length >= 3) {
    nav[0].addEventListener('click', () => openSection('raw-section'));
    nav[1].addEventListener('click', () => openSection('smoothie-section'));
    nav[2].addEventListener('click', () => openSection('about-section'));
  }

  // Закрывашки секций и модалки
  $$('.close-section').forEach(btn => btn.addEventListener('click', closeSections));
  $('.modal-close')?.addEventListener('click', closeOrderForm);

  // Esc закрывает всё
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSections();
      $('#sidebar')?.classList.remove('active');
      $('#order-modal')?.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Тема при загрузке
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }

  // Плавающая форма
  $('.floating-header')?.addEventListener('click', toggleFloatingOrder);
  $('#floating-order-form')?.addEventListener('submit', window.submitFloatingOrder);

  // Форма заказа в модалке
  $('#order-form')?.addEventListener('submit', window.submitOrder);

  // Карусель: грузим товары
  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('API error');
      const smoothies = await res.json();
      return Array.isArray(smoothies) ? smoothies : [];
    } catch (err) {
      console.error("❌ Feil ved henting:", err);
      return [];
    }
  }

  const smoothies = await fetchProducts();
  const carousel = $("#carousel3d");
  if (carousel) {
    if (!smoothies.length) {
      carousel.innerHTML = "<p style='text-align:center;color:white;'>Ingen smoothies tilgjengelig</p>";
    } else {
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

      cards = $$("#carousel3d .card");
      setup3D();
      update3D();

      $("#prev3d")?.addEventListener("click", carouselPrev);
      $("#next3d")?.addEventListener("click", carouselNext);

      $$(".order-btn").forEach(btn =>
        btn.addEventListener("click", () => openOrderForm(btn.dataset.product))
      );
    }
  }

  /* ====== Опциональный блок админ-таблицы (подстраховка) ====== */
  const tableBody = $("#smoothieTable tbody");
  const addForm   = $("#addForm");
  const loader    = $("#loader");
  if (tableBody && addForm && loader) {
    const loadTable = async () => {
      tableBody.innerHTML = "";
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("API error");
        const items = await res.json();

        items.forEach((s) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${s.name}</td>
            <td>${s.ingredients}</td>
            <td><img src="${s.image}" alt="${s.name}" style="width:100px; border-radius:6px;"></td>
            <td><button data-id="${s.id}" class="del-btn"><i class="fa fa-trash"></i> Slett</button></td>
          `;
          tableBody.appendChild(row);
        });

        $$(".del-btn", tableBody).forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (!confirm('Slette denne smoothien?')) return;
            const delRes = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!delRes.ok) return alert('Kunne ikke slette.');
            loadTable();
          });
        });
      } catch (e) {
        console.error(e);
        alert("Kunne ikke laste produkter");
      }
    };

    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name       = $("#name")?.value.trim();
      const ingredients= $("#ingredients")?.value.trim();
      const imageUrl   = $("#image")?.value.trim();
      if (!name || !ingredients || !imageUrl) {
        alert("Vennligst fyll ut alle feltene!");
        return;
      }

      loader.classList.add("active");
      try {
        const formData = new FormData();
        formData.append("image_url", imageUrl);
        formData.append("size", "auto");

        const res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: { "X-Api-Key": "Ri77YTZ6LffapymeE3ioKzvW" },
          body: formData
        });
        if (!res.ok) throw new Error("Remove.bg feilet!");

        const blob = await res.blob();
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        const apiRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, ingredients, image: base64data })
        });

        loader.classList.remove("active");
        if (!apiRes.ok) {
          console.error(await apiRes.text());
          return alert("Kunne ikke lagre i databasen.");
        }

        alert("✅ Smoothie lagt til (DB)!");
        addForm.reset();
        loadTable();
      } catch (err) {
        console.error("❌ Feil:", err);
        loader.classList.remove("active");
        alert("Feil under bildebehandling eller lagring.");
      }
    });

    loadTable();
  }

  // === Иконка кнопки темы ===
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;

  const updateIcon = () => {
    const isLight = document.body.classList.contains('light-mode');
    themeBtn.textContent = isLight ? '🌙' : '☀️';
  };

  // при клике — переключаем тему и обновляем иконку
  themeBtn.addEventListener('click', () => {
    toggleTheme();
    updateIcon();
  });

  // инициализация при загрузке
  updateIcon();
});


}); 
