/* ===== Sidebar ===== */
function toggleMenu(){
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('active');
}
document.addEventListener('click', (e)=>{
  const s = document.getElementById('sidebar');
  const btn = document.getElementById('menuBtn');
  if (!s || !btn) return;
  if (s.classList.contains('active') && !s.contains(e.target) && !btn.contains(e.target)){
    s.classList.remove('active');
  }
});
function performSearch(){
  const q = (document.getElementById('sidebar-search')?.value || '').trim();
  if(!q) return alert('Vennligst skriv inn et søkeord');
  alert('Søk: ' + q);
}

/* ===== Modal order form (GIF + typed info) ===== */
const PRODUCTS = {
  "Ananas og mango": {
    gif: "Images/gif/ananas_mango.gif",
    info: "Frisk og tropisk blanding: mango, ananas, eple og pasjonsfrukt.\n250 ml · Uten tilsatt sukker · Kilde til C-vitamin."
  },
  "Blåbær og eple": {
    gif: "Images/gif/blabaer_eple.gif",
    info: "Fyldig smak av blåbær med frisk eple og et hint av solbær.\n250 ml · 1 av 5 om dagen."
  },
  "Bringebær og jordbær": {
    gif: "Images/gif/bringebaer_jordbaer.gif",
    info: "Søt og bærfrisk: bringebær, jordbær, eple.\nPerfekt som snack eller på farten."
  },
  "Kiwi og eple": {
    gif: "Images/gif/kiwi_eple.gif",
    info: "Grønn og frisk miks: kiwi og eple.\nGir deg energi og et friskt kick – uten tilsatt sukker."
  }
};
// Preload GIFs
(function preloadGIFs(){ Object.values(PRODUCTS).forEach(p=>{ if(p?.gif){ const img=new Image(); img.src=p.gif; } }); })();

let _twTimer = null;
function typeText(el, text, speed = 18){
  if (_twTimer) { clearInterval(_twTimer); _twTimer = null; }
  if (!el) return;
  el.textContent = "";
  let i = 0;
  _twTimer = setInterval(()=>{
    el.textContent = text.slice(0, i++);
    if (i > text.length){ clearInterval(_twTimer); _twTimer = null; }
  }, speed);
}

function openOrderForm(productName){
  const modal   = document.getElementById("order-modal");
  const title   = document.getElementById("order-title");
  const nameInp = document.getElementById("product-name");
  const gifEl   = document.getElementById("pour-gif");
  const nameEl  = document.getElementById("pour-name");
  const typedEl = document.getElementById("typed-line");

  nameInp.value = productName || "";
  title.textContent = "Bestill produkt";
  nameEl.textContent = productName || "";

  const meta = PRODUCTS[productName] || null;
  if (meta?.gif){ gifEl.src = meta.gif; gifEl.style.visibility='visible'; }
  else { gifEl.removeAttribute('src'); gifEl.style.visibility='hidden'; }

  typeText(typedEl, meta?.info || "Utvalgt smoothie.", 16);

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}
function closeOrderForm(){
  const modal = document.getElementById("order-modal");
  const form  = document.getElementById("order-form");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  form.reset();
  if (_twTimer) { clearInterval(_twTimer); _twTimer = null; }
}
function submitOrder(e){
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  alert(`Takk! Vi kontakter deg på ${d.email}.\n\nProdukt: ${d.product}\nAntall: ${d.quantity}`);
  closeOrderForm();
}
document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.order-btn');
  if (btn) openOrderForm(btn.dataset.product || btn.textContent.trim() || 'Smoothie');
});

/* ===== Floating mini form ===== */
function toggleFloatingOrder(){ document.getElementById('floating-order')?.classList.toggle('collapsed'); }
function submitFloatingOrder(e){
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  alert(`Takk! Vi kontakter deg på ${d.email}.\n\nSmoothie: ${d.smoothie}\nAntall: ${d.quantity}\nKommentar: ${d.comment||'—'}`);
  e.target.reset(); toggleFloatingOrder();
}

/* ===== 3D CAROUSEL – ring (all items visible) ===== */
let currentIndex = 0;      // may be fractional during animation
let angleStep   = 0;
let radius      = 0;
let isDragging  = false;
let dragStartX  = 0;
let accumulatedDeg = 0;
let animating   = false;

const scene = document.getElementById('carousel3d');
const cards = Array.from(document.querySelectorAll('#carousel3d .card'));

function applyCardTransform(card, angleDeg, isActive){
  const base = `translate(-50%, -50%) rotateY(${angleDeg}deg) translateZ(${radius}px) rotateY(${-angleDeg}deg)`;
  card.style.transform = isActive ? `${base} scale(1.04)` : `${base} scale(0.93)`;
  card.style.opacity   = isActive ? '1' : '0.85';
  card.style.zIndex    = isActive ? '3' : '1';
  card.classList.toggle('active', !!isActive);
}

function setup3D(){
  if (!scene || !cards.length) return;
  const n = cards.length;
  angleStep = 360 / n;

  const cardW = cards[0].getBoundingClientRect().width;
  const baseRadius = cardW / (2 * Math.tan(Math.PI / n));
  const ringScale  = 0.62; // 0.55–0.70
  radius = Math.max(120, Math.round(baseRadius * ringScale));

  scene.style.transform = `translateZ(-${radius}px) rotateX(6deg)`;
  update3D();
}
function update3D(){
  const n = cards.length; if (!n) return;
  const rotDeg = -currentIndex * angleStep + accumulatedDeg;
  const active = (((Math.round(-rotDeg / angleStep)) % n) + n) % n;
  for (let i = 0; i < n; i++){
    const angle = i * angleStep + rotDeg;
    applyCardTransform(cards[i], angle, i === active);
  }
}
function animateTo(delta){
  if (animating) return;
  animating = true;
  const start = performance.now();
  const duration = 550; // ms
  const startIndex = currentIndex;
  const endIndex   = startIndex + delta;
  function frame(t){
    const p = Math.min(1, (t - start) / duration);
    const ease = 1 - Math.pow(1 - p, 3); // easeOutCubic
    currentIndex = startIndex + (endIndex - startIndex) * ease;
    update3D();
    if (p < 1){ requestAnimationFrame(frame); }
    else { currentIndex = endIndex; accumulatedDeg = 0; animating = false; update3D(); }
  }
  requestAnimationFrame(frame);
}
function carouselNext(){ animateTo(+1); }
function carouselPrev(){ animateTo(-1); }
document.getElementById('prev3d')?.addEventListener('click', carouselPrev);
document.getElementById('next3d')?.addEventListener('click', carouselNext);

function onPointerDown(e){ if(animating) return; isDragging = true; dragStartX = e.clientX || (e.touches && e.touches[0].clientX); }
function onPointerMove(e){
  if(!isDragging || animating) return;
  const x = e.clientX || (e.touches && e.touches[0].clientX);
  const dx = x - dragStartX;
  accumulatedDeg = dx * 0.25; update3D();
}
function onPointerUp(){
  if(!isDragging || animating) return; isDragging = false;
  const snapped = Math.round(accumulatedDeg / angleStep);
  accumulatedDeg = 0;
  if (snapped !== 0) animateTo(-snapped); else update3D();
}
scene?.addEventListener('mousedown', onPointerDown);
scene?.addEventListener('mousemove', onPointerMove);
scene?.addEventListener('mouseup', onPointerUp);
scene?.addEventListener('mouseleave', onPointerUp);
scene?.addEventListener('touchstart', onPointerDown, {passive:true});
scene?.addEventListener('touchmove', onPointerMove, {passive:true});
scene?.addEventListener('touchend', onPointerUp);

window.addEventListener('resize', setup3D);
document.addEventListener('DOMContentLoaded', setup3D);
