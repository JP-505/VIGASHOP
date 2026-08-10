/* =========================================================
   VigaShop — Lógica de la aplicación
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- Storage helpers ---------------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };

  let cart = store.get("vigashop_cart", []);         // [{id, qty}]
  let favorites = store.get("vigashop_favs", []);     // [id,...]
  let users = store.get("vigashop_users", []);        // [{name, email, password}]
  let session = store.get("vigashop_session", null);  // email or null
  let purchases = store.get("vigashop_purchases", {}); // { email: [order,...] }

  const persist = {
    cart: () => store.set("vigashop_cart", cart),
    favorites: () => store.set("vigashop_favs", favorites),
    users: () => store.set("vigashop_users", users),
    session: () => store.set("vigashop_session", session),
    purchases: () => store.set("vigashop_purchases", purchases)
  };

  const money = (n) => "$" + n.toFixed(2);
  const finalPrice = (g) => g.discount > 0 ? g.price * (1 - g.discount / 100) : g.price;
  const findGame = (id) => GAMES.find((g) => g.id === id);

  /* ---------------- App state (filters) ---------------- */
  const state = { view: "all", search: "", genre: "", sort: "default" };

  /* ---------------- DOM refs ---------------- */
  const $ = (sel) => document.querySelector(sel);
  const gameGrid = $("#gameGrid");
  const emptyState = $("#emptyState");
  const resultsCount = $("#resultsCount");
  const viewTitle = $("#viewTitle");
  const genreFilter = $("#genreFilter");
  const sortFilter = $("#sortFilter");
  const searchInput = $("#searchInput");
  const overlay = $("#overlay");
  const cartDrawer = $("#cartDrawer");
  const cartItemsEl = $("#cartItems");
  const cartEmptyEl = $("#cartEmpty");
  const cartSummaryEl = $("#cartSummary");
  const cartTotalEl = $("#cartTotal");
  const cartCountEl = $("#cartCount");

  /* ============================================================
     CATÁLOGO — historias: ver, buscar, filtrar, ordenar, detalle,
     precio, plataformas
     ============================================================ */
  function populateGenres() {
    const genres = [...new Set(GAMES.map((g) => g.genre))].sort();
    genres.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g; opt.textContent = g;
      genreFilter.appendChild(opt);
    });
  }

  function getFilteredGames() {
    let list = [...GAMES];

    if (state.view === "offers") list = list.filter((g) => g.discount > 0);
    if (state.view === "favorites") list = list.filter((g) => favorites.includes(g.id));

    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q));
    }
    if (state.genre) list = list.filter((g) => g.genre === state.genre);

    if (state.sort === "asc") list.sort((a, b) => finalPrice(a) - finalPrice(b));
    if (state.sort === "desc") list.sort((a, b) => finalPrice(b) - finalPrice(a));

    return list;
  }

  function cardTemplate(g) {
    const isFav = favorites.includes(g.id);
    const price = finalPrice(g);
    return `
      <article class="game-card" data-genre="${g.genre}">
        <div class="card-art">
          <span>${g.icon}</span>
          <div class="card-badges">
            ${g.isNew ? '<span class="badge badge-new">Nuevo</span>' : ""}
            ${g.discount > 0 ? `<span class="badge badge-offer">-${g.discount}%</span>` : ""}
          </div>
          <button class="fav-btn ${isFav ? "active" : ""}" data-fav="${g.id}" aria-label="Favorito" title="Agregar a favoritos">${isFav ? "♥" : "♡"}</button>
        </div>
        <div class="card-body">
          <span class="card-genre">${g.genre}</span>
          <button class="card-title" data-detail="${g.id}">${g.title}</button>
          <div class="card-platforms">${g.platforms.map((p) => `<span class="plat-chip">${p}</span>`).join("")}</div>
          <div class="card-foot">
            <div class="price-wrap">
              ${g.discount > 0 ? `<span class="price-old">${money(g.price)}</span>` : ""}
              <span class="price-now ${g.discount > 0 ? "on-offer" : ""}">${money(price)}</span>
            </div>
            <button class="add-btn" data-add="${g.id}" aria-label="Añadir al carrito" title="Añadir al carrito">+</button>
          </div>
        </div>
      </article>`;
  }

  function renderGrid() {
    const list = getFilteredGames();
    const titles = { all: "Catálogo completo", offers: "Ofertas activas", favorites: "Tus favoritos" };
    viewTitle.textContent = titles[state.view];

    gameGrid.innerHTML = list.map(cardTemplate).join("");
    emptyState.hidden = list.length !== 0;
    gameGrid.hidden = list.length === 0;

    resultsCount.textContent = list.length === 1 ? "1 juego encontrado" : `${list.length} juegos encontrados`;
  }

  function renderTicker() {
    const highlights = GAMES.filter((g) => g.isNew || g.discount > 0);
    const track = $("#tickerTrack");
    const items = highlights.map((g) => {
      const tag = g.discount > 0 ? `<span>-${g.discount}%</span> ${g.title}` : `<span>NUEVO</span> ${g.title}`;
      return `<span>${tag}</span>`;
    });
    track.innerHTML = (items.concat(items)).join(""); // duplicado para loop continuo
  }

  /* ---------------- Detalle de producto ---------------- */
  function openProductModal(id) {
    const g = findGame(id);
    if (!g) return;
    const price = finalPrice(g);
    $("#productModalContent").innerHTML = `
      <button class="close-btn modal-close" data-close="product">✕</button>
      <div class="product-detail" data-genre="${g.genre}">
        <div class="product-art">${g.icon}</div>
        <div class="product-info">
          <h2>${g.title}</h2>
          <div class="product-meta">
            <span class="badge badge-offer" style="background:var(--surface-hi);color:var(--text)">⭐ ${g.rating}</span>
            <span class="badge badge-offer" style="background:var(--surface-hi);color:var(--text)">${g.genre}</span>
            ${g.isNew ? '<span class="badge badge-new">Nuevo</span>' : ""}
            ${g.discount > 0 ? `<span class="badge badge-offer">-${g.discount}%</span>` : ""}
          </div>
          <p class="product-desc">${g.description}</p>
          <p class="muted" style="margin-bottom:.4rem;font-weight:600;">Plataformas compatibles</p>
          <div class="product-plats">${g.platforms.map((p) => `<span class="plat-chip">${p}</span>`).join("")}</div>
          <div class="product-price-row">
            <div class="price-wrap">
              ${g.discount > 0 ? `<span class="price-old">${money(g.price)}</span>` : ""}
              <span class="price-now ${g.discount > 0 ? "on-offer" : ""}">${money(price)}</span>
            </div>
            <button class="btn btn-accent" data-add="${g.id}">Añadir al carrito</button>
            <button class="fav-btn ${favorites.includes(g.id) ? "active" : ""}" data-fav="${g.id}" style="position:static">${favorites.includes(g.id) ? "♥" : "♡"}</button>
          </div>
        </div>
      </div>`;
    openModal("productModal");
  }

  /* ============================================================
     FAVORITOS
     ============================================================ */
  function toggleFavorite(id) {
    if (favorites.includes(id)) favorites = favorites.filter((f) => f !== id);
    else favorites.push(id);
    persist.favorites();
    renderGrid();
    if ($("#productModal").classList.contains("open")) openProductModal(id);
  }

  /* ============================================================
     CARRITO — historias: agregar, eliminar, total, modificar cantidad
     ============================================================ */
  function addToCart(id) {
    const line = cart.find((c) => c.id === id);
    if (line) line.qty += 1;
    else cart.push({ id, qty: 1 });
    persist.cart();
    renderCart();
    flashCartButton();
  }

  function flashCartButton() {
    const btn = $("#cartBtn");
    btn.style.borderColor = "var(--accent-2)";
    setTimeout(() => (btn.style.borderColor = ""), 350);
  }

  function removeFromCart(id) {
    cart = cart.filter((c) => c.id !== id);
    persist.cart();
    renderCart();
  }

  function changeQty(id, delta) {
    const line = cart.find((c) => c.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter((c) => c.id !== id);
    persist.cart();
    renderCart();
  }

  function cartTotal() {
    return cart.reduce((sum, c) => {
      const g = findGame(c.id);
      return g ? sum + finalPrice(g) * c.qty : sum;
    }, 0);
  }

  function renderCart() {
    const totalItems = cart.reduce((n, c) => n + c.qty, 0);
    cartCountEl.textContent = totalItems;

    if (cart.length === 0) {
      cartItemsEl.hidden = true; cartSummaryEl.hidden = true; cartEmptyEl.hidden = false;
      return;
    }
    cartEmptyEl.hidden = true; cartItemsEl.hidden = false; cartSummaryEl.hidden = false;

    cartItemsEl.innerHTML = cart.map((c) => {
      const g = findGame(c.id);
      if (!g) return "";
      return `
        <div class="cart-item" data-genre="${g.genre}">
          <div class="cart-item-art">${g.icon}</div>
          <div class="cart-item-info">
            <p class="name">${g.title}</p>
            <p class="unit">${money(finalPrice(g))} c/u</p>
            <div class="qty-control">
              <button data-qty="${g.id}" data-delta="-1" aria-label="Quitar uno">−</button>
              <span>${c.qty}</span>
              <button data-qty="${g.id}" data-delta="1" aria-label="Añadir uno">+</button>
            </div>
          </div>
          <button class="remove-item" data-remove="${g.id}" aria-label="Eliminar del carrito">🗑</button>
        </div>`;
    }).join("");

    cartTotalEl.textContent = money(cartTotal());
  }

  function openCart() { openDrawer("cartDrawer"); }

  /* ============================================================
     MODALES / DRAWER genéricos
     ============================================================ */
  function showOverlay() { overlay.hidden = false; }
  function hideOverlay() { overlay.hidden = true; }

  function openDrawer(id) { $("#" + id).classList.add("open"); showOverlay(); }
  function closeDrawer(id) { $("#" + id).classList.remove("open"); hideOverlay(); }

  function openModal(id) { $("#" + id).classList.add("open"); showOverlay(); }
  function closeModal(id) { $("#" + id).classList.remove("open"); hideOverlay(); }

  function closeAllOverlays() {
    document.querySelectorAll(".drawer.open").forEach((d) => d.classList.remove("open"));
    document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
    hideOverlay();
  }

  /* ============================================================
     CUENTA — historias: registro, login, recuperar contraseña
     ============================================================ */
  function updateAccountUI() {
    const label = $("#accountLabel");
    const menu = $("#accountMenu");
    if (session) {
      const user = users.find((u) => u.email === session);
      label.textContent = user ? user.name.split(" ")[0] : "Cuenta";
      menu.innerHTML = `
        <button data-action="history">Historial de compras</button>
        <button data-action="logout">Cerrar sesión</button>`;
    } else {
      label.textContent = "Cuenta";
      menu.innerHTML = `
        <button data-action="login">Iniciar sesión</button>
        <button data-action="register">Crear cuenta</button>`;
    }
  }

  function openAuth(tab) {
    switchAuthTab(tab || "login");
    openModal("authModal");
  }

  function switchAuthTab(tab) {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
    $("#loginForm").hidden = tab !== "login";
    $("#registerForm").hidden = tab !== "register";
    $("#forgotForm").hidden = tab !== "forgot";
  }

  function handleRegister(e) {
    e.preventDefault();
    const name = $("#registerName").value.trim();
    const email = $("#registerEmail").value.trim().toLowerCase();
    const password = $("#registerPassword").value;
    const note = $("#registerNote");

    if (users.some((u) => u.email === email)) {
      note.textContent = "Ya existe una cuenta con ese correo.";
      note.classList.add("error");
      return;
    }
    users.push({ name, email, password });
    persist.users();
    session = email; persist.session();
    note.classList.remove("error");
    note.textContent = "¡Cuenta creada! Iniciando sesión…";
    updateAccountUI();
    setTimeout(() => { closeModal("authModal"); note.textContent = ""; e.target.reset(); }, 700);
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const password = $("#loginPassword").value;
    const note = $("#loginNote");
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      note.textContent = "Correo o contraseña incorrectos.";
      note.classList.add("error");
      return;
    }
    session = email; persist.session();
    note.classList.remove("error");
    note.textContent = `¡Bienvenido, ${user.name}!`;
    updateAccountUI();
    const pendingCheckout = $("#authModal").dataset.pendingCheckout === "1";
    setTimeout(() => {
      closeModal("authModal"); note.textContent = ""; e.target.reset();
      if (pendingCheckout) { $("#authModal").dataset.pendingCheckout = "0"; openCheckout(); }
    }, 500);
  }

  function handleForgot(e) {
    e.preventDefault();
    const email = $("#forgotEmail").value.trim().toLowerCase();
    const newPassword = $("#forgotPassword").value;
    const note = $("#forgotNote");
    const user = users.find((u) => u.email === email);
    if (!user) {
      note.textContent = "No encontramos una cuenta con ese correo.";
      note.classList.add("error");
      return;
    }
    user.password = newPassword;
    persist.users();
    note.classList.remove("error");
    note.textContent = "Contraseña actualizada. Ya puedes iniciar sesión.";
    setTimeout(() => { switchAuthTab("login"); note.textContent = ""; e.target.reset(); }, 900);
  }

  function logout() {
    session = null; persist.session();
    updateAccountUI();
    $("#accountMenu").hidden = true;
  }

  /* ============================================================
     PAGO / CHECKOUT / CONFIRMACIÓN / HISTORIAL
     ============================================================ */
  function openCheckout() {
    if (cart.length === 0) return;
    if (!session) {
      $("#authModal").dataset.pendingCheckout = "1";
      openAuth("login");
      $("#loginNote").textContent = "Inicia sesión para completar tu compra.";
      return;
    }
    closeDrawer("cartDrawer");
    $("#checkoutTotal").textContent = money(cartTotal());
    openModal("checkoutModal");
  }

  function confirmPayment() {
    const method = document.querySelector('input[name="payment"]:checked').value;
    const order = {
      id: "VG-" + Date.now().toString().slice(-8),
      date: new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }),
      method,
      total: cartTotal(),
      items: cart.map((c) => {
        const g = findGame(c.id);
        return { title: g.title, qty: c.qty, price: finalPrice(g) };
      })
    };
    if (!purchases[session]) purchases[session] = [];
    purchases[session].unshift(order);
    persist.purchases();

    cart = []; persist.cart(); renderCart();

    closeModal("checkoutModal");
    $("#confirmDetails").innerHTML = `
      <p>Número de orden: <span class="order-id">${order.id}</span></p>
      <p>Fecha: ${order.date}</p>
      <p>Método de pago: ${order.method}</p>
      <p>Total pagado: <strong>${money(order.total)}</strong></p>`;
    openModal("confirmModal");
  }

  function renderHistory() {
    const list = $("#historyList");
    if (!session) {
      list.innerHTML = `<p class="muted">Inicia sesión para ver tu historial de compras.</p>`;
      return;
    }
    const orders = purchases[session] || [];
    if (orders.length === 0) {
      list.innerHTML = `<p class="muted">Aún no tienes compras registradas.</p>`;
      return;
    }
    list.innerHTML = orders.map((o) => `
      <div class="history-order">
        <div class="history-order-head">
          <span><strong>${o.id}</strong> · ${o.date}</span>
          <span>${o.method}</span>
        </div>
        <div class="history-order-items">
          ${o.items.map((it) => `<span>${it.qty}× ${it.title} — ${money(it.price * it.qty)}</span>`).join("")}
        </div>
        <div class="history-order-head" style="margin-top:.6rem;margin-bottom:0;">
          <span></span><span><strong>Total: ${money(o.total)}</strong></span>
        </div>
      </div>`).join("");
  }

  /* ============================================================
     SOPORTE / CONTACTO
     ============================================================ */
  function handleContact(e) {
    e.preventDefault();
    const note = $("#contactNote");
    note.classList.remove("error");
    note.textContent = "¡Mensaje enviado! Nuestro equipo te responderá pronto.";
    e.target.reset();
    setTimeout(() => (note.textContent = ""), 3500);
  }

  /* ============================================================
     EVENTOS
     ============================================================ */
  function init() {
    populateGenres();
    renderTicker();
    renderGrid();
    renderCart();
    updateAccountUI();

    // Filtros
    searchInput.addEventListener("input", (e) => { state.search = e.target.value; renderGrid(); });
    genreFilter.addEventListener("change", (e) => { state.genre = e.target.value; renderGrid(); });
    sortFilter.addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
    $("#resetFiltersBtn").addEventListener("click", () => {
      state.search = ""; state.genre = ""; state.sort = "default";
      searchInput.value = ""; genreFilter.value = ""; sortFilter.value = "default";
      renderGrid();
    });

    // Navegación por vistas
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        state.view = tab.dataset.view;
        renderGrid();
        window.scrollTo({ top: $("#catalogSection").offsetTop - 90, behavior: "smooth" });
      });
    });
    $("#heroOffersBtn").addEventListener("click", () => document.querySelector('[data-view="offers"]').click());
    $("#logoBtn").addEventListener("click", () => document.querySelector('[data-view="all"]').click());

    // Delegación: tarjetas del grid
    gameGrid.addEventListener("click", (e) => {
      const detailId = e.target.closest("[data-detail]")?.dataset.detail;
      const addId = e.target.closest("[data-add]")?.dataset.add;
      const favId = e.target.closest("[data-fav]")?.dataset.fav;
      if (detailId) openProductModal(detailId);
      else if (addId) addToCart(addId);
      else if (favId) toggleFavorite(favId);
    });

    // Delegación dentro del modal de producto (añadir / favorito)
    $("#productModalContent").addEventListener("click", (e) => {
      const addId = e.target.closest("[data-add]")?.dataset.add;
      const favId = e.target.closest("[data-fav]")?.dataset.fav;
      if (addId) addToCart(addId);
      else if (favId) toggleFavorite(favId);
    });

    // Carrito
    $("#cartBtn").addEventListener("click", openCart);
    cartItemsEl.addEventListener("click", (e) => {
      const qtyBtn = e.target.closest("[data-qty]");
      const removeBtn = e.target.closest("[data-remove]");
      if (qtyBtn) changeQty(qtyBtn.dataset.qty, Number(qtyBtn.dataset.delta));
      if (removeBtn) removeFromCart(removeBtn.dataset.remove);
    });
    $("#checkoutBtn").addEventListener("click", openCheckout);

    // Cuenta
    $("#accountBtn").addEventListener("click", () => {
      const menu = $("#accountMenu");
      menu.hidden = !menu.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".account-wrap")) $("#accountMenu").hidden = true;
    });
    document.body.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (!action) return;
      if (action === "login") openAuth("login");
      if (action === "register") openAuth("register");
      if (action === "logout") logout();
      if (action === "history") { renderHistory(); openModal("historyModal"); }
      if (action === "favorites-link") document.querySelector('[data-view="favorites"]').click();
    });

    document.querySelectorAll(".auth-tab").forEach((tab) => tab.addEventListener("click", () => switchAuthTab(tab.dataset.tab)));
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      if (!btn.classList.contains("auth-tab")) btn.addEventListener("click", () => switchAuthTab(btn.dataset.tab));
    });
    $("#registerForm").addEventListener("submit", handleRegister);
    $("#loginForm").addEventListener("submit", handleLogin);
    $("#forgotForm").addEventListener("submit", handleForgot);

    // Checkout / confirmación
    $("#confirmPaymentBtn").addEventListener("click", confirmPayment);

    // Contacto
    $("#contactForm").addEventListener("submit", handleContact);

    // Cierre genérico de modales / drawers
    overlay.addEventListener("click", closeAllOverlays);
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.close;
        if (target === "cart") closeDrawer("cartDrawer");
        else closeAllOverlays();
      });
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAllOverlays(); });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
