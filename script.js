
const products = [
  {id:1,name:"Premium T-Shirt",price:799,category:"men",image:"images/tshirt.jpg",sizes:["S","M","L","XL"]},
  {id:2,name:"Men Casual Shirt",price:1299,category:"men",image:"images/shirt.jpg",sizes:["S","M","L","XL"]},
  {id:3,name:"Men Slim Fit Jeans",price:1799,category:"men",image:"images/jeans.jpg",sizes:["S","M","L","XL"]},
  {id:4,name:"Men Casual Shoes",price:2199,category:"men",image:"images/shoes.jpg",sizes:["S","M","L","XL"]},
  {id:5,name:"Men Classic Watch",price:2999,category:"men",image:"images/men-watch.jpg",sizes:[]},
  {id:6,name:"Women Elegant Dress",price:1499,category:"women",image:"images/dress.jpg",sizes:["S","M","L","XL"]},
  {id:7,name:"Women Premium Handbag",price:1899,category:"women",image:"images/handbag.jpg",sizes:[]},
  {id:8,name:"Women Fashion Footwear",price:2299,category:"women",image:"images/women-footwear.jpg",sizes:["S","M","L","XL"]},
  {id:9,name:"Women Classic Watch",price:2799,category:"women",image:"images/women-watch.jpg",sizes:[]},
  {id:10,name:"Kids T-Shirt",price:599,category:"kids",image:"images/kids.jpg",sizes:["S","M","L","XL"]},
  {id:11,name:"Kids Fashion Dress",price:899,category:"kids",image:"images/kids-dress.jpg",sizes:["S","M","L","XL"]},
  {id:12,name:"Kids Casual Shoes",price:999,category:"kids",image:"images/kids-shoes.jpg",sizes:["S","M","L","XL"]},
  {id:13,name:"Kids Smart Watch",price:1499,category:"kids",image:"images/kids-watch.jpg",sizes:[]},
  {id:14,name:"Running Shoes",price:1999,category:"men",image:"images/shoes.jpg",sizes:["S","M","L","XL"]},
  {id:15,name:"Wireless Headphones",price:2499,category:"electronics",image:"images/headphones.jpg",sizes:[]},
  {id:16,name:"Smart Laptop",price:45999,category:"electronics",image:"images/laptop.jpg",sizes:[]},
  {id:17,name:"Smartphone",price:12999,category:"electronics",image:"images/smartphone.jpg",sizes:[]},
  {id:18,name:"Wireless Mouse",price:699,category:"electronics",image:"images/mouse.jpg",sizes:[]},
  {id:19,name:"Wireless Earbuds",price:1499,category:"electronics",image:"images/earbuds.jpg",sizes:[]}
];

const money = amount =>
  "₹" + amount.toLocaleString("en-IN");

let category = "all";
let cart = [];
let chosenSize = "M";
let currentDetailId = null;
let toastTimer;

const $ = id => document.getElementById(id);
const grid = $("product-grid");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderProducts() {
  const query = $("product-search").value.trim().toLowerCase();
  const maxPrice = Number($("price-range").value);
  const size = $("size-filter").value;

  let list = products.filter(product => {
    const matchesCategory =
      category === "all" || product.category === category;

    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.category.includes(query);

    const matchesPrice = product.price <= maxPrice;

    const matchesSize =
      size === "all" || product.sizes.includes(size);

    return matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesSize;
  });

  const sort = $("sort-products").value;

  if (sort === "low") {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === "high") {
    list.sort((a, b) => b.price - a.price);
  }

  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          onerror="this.style.display='none';this.parentElement.innerHTML='<span style=&quot;font-size:42px;color:#7043d8&quot;>✦</span>'"
        >
      </div>

      <div class="product-info">
        <p class="product-category">
          ${escapeHTML(product.category)}
        </p>

        <h3>${escapeHTML(product.name)}</h3>

        <div class="product-bottom">
          <span class="product-price">${money(product.price)}</span>
          <button
            class="add-button"
            data-add="${product.id}"
            aria-label="Add ${escapeHTML(product.name)} to cart"
          >+</button>
        </div>

        <p class="size-note">
          ${product.sizes.length
            ? "Sizes: " + product.sizes.join(" · ")
            : "One size"}
        </p>

        <button class="details-button" data-details="${product.id}">
          View details →
        </button>
      </div>
    </article>
  `).join("");

  $("result-count").textContent =
    `${list.length} product(s) found`;

  $("empty-results").hidden = list.length !== 0;
  grid.hidden = list.length === 0;
}

function resetFilters() {
  $("product-search").value = "";
  $("price-range").value = 50000;
  $("price-value").textContent = money(50000);
  $("size-filter").value = "all";
  $("sort-products").value = "featured";

  category = "all";

  document.querySelectorAll(".categories button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "all"
    );
  });

  renderProducts();
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    $("toast").classList.remove("show");
  }, 2300);
}

function addToCart(id, size = "") {
  const product = products.find(item => item.id === Number(id));

  if (!product) return;

  const existing = cart.find(item =>
    item.id === product.id && item.size === size
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      quantity: 1
    });
  }

  renderCart();
  showToast(product.name + " added to cart");
}

function renderCart() {
  const count = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  $("cart-count").textContent = count;
  $("cart-total").textContent = money(total);
  $("checkout-total").textContent = money(total);

  $("cart-items").innerHTML = cart.length
    ? cart.map(item => `
      <div class="cart-item">
        <h3>${escapeHTML(item.name)}</h3>
        <p>
          ${money(item.price)}
          ${item.size ? " · Size " + escapeHTML(item.size) : ""}
        </p>

        <div class="cart-item-actions">
          <button
            class="quantity-button"
            data-qty="-1"
            data-id="${item.id}"
            data-size="${escapeHTML(item.size)}"
          >−</button>

          <strong>${item.quantity}</strong>

          <button
            class="quantity-button"
            data-qty="1"
            data-id="${item.id}"
            data-size="${escapeHTML(item.size)}"
          >+</button>

          <button
            class="remove-button"
            data-remove="${item.id}"
            data-size="${escapeHTML(item.size)}"
          >Remove</button>
        </div>
      </div>
    `).join("")
    : `<div class="empty-cart">🛍️<p>Your cart is empty.</p></div>`;

  $("checkout-button").disabled = cart.length === 0;
  $("checkout-button").style.opacity =
    cart.length ? "1" : ".5";
}

function openCart() {
  $("cart-drawer").classList.add("open");
  $("overlay").hidden = false;
}

function closeCart() {
  $("cart-drawer").classList.remove("open");
  $("overlay").hidden = true;
}

function showDetails(id) {
  const product = products.find(item => item.id === Number(id));

  if (!product) return;

  currentDetailId = product.id;
  chosenSize = product.sizes.includes("M")
    ? "M"
    : (product.sizes[0] || "");

  $("product-details").innerHTML = `
    <img
      class="detail-image"
      src="${escapeHTML(product.image)}"
      alt="${escapeHTML(product.name)}"
      onerror="this.style.visibility='hidden'"
    >

    <p class="product-category">${escapeHTML(product.category)}</p>
    <h2>${escapeHTML(product.name)}</h2>
    <h3>${money(product.price)}</h3>
    <p>Explore this product from the NEXORA collection.</p>

    ${product.sizes.length ? `
      <p>Choose Size:</p>
      <div class="detail-size">
        ${product.sizes.map(size => `
          <button
            class="size-option ${size === chosenSize ? "selected" : ""}"
            data-size="${size}"
          >${size}</button>
        `).join("")}
      </div>
    ` : ""}

    <button class="primary-btn full-btn" id="detail-add">
      Add to Cart
    </button>
  `;

  $("product-dialog").showModal();
}

// Category buttons
document.querySelectorAll(".categories button").forEach(button => {
  button.addEventListener("click", () => {
    category = button.dataset.category;

    document.querySelectorAll(".categories button").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderProducts();
  });
});

// Search, price, size and sorting
$("product-search").addEventListener("input", renderProducts);
$("sort-products").addEventListener("change", renderProducts);
$("size-filter").addEventListener("change", renderProducts);

$("price-range").addEventListener("input", () => {
  $("price-value").textContent =
    money(Number($("price-range").value));

  renderProducts();
});

$("reset-filters").addEventListener("click", resetFilters);

// Product card buttons
grid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const detailsButton = event.target.closest("[data-details]");

  if (addButton) {
    addToCart(addButton.dataset.add);
  }

  if (detailsButton) {
    showDetails(detailsButton.dataset.details);
  }
});

// Cart open and close
$("open-cart").addEventListener("click", openCart);
$("close-cart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

// Cart quantity and remove buttons
$("cart-items").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const item = cart.find(item =>
      item.id === Number(quantityButton.dataset.id) &&
      item.size === quantityButton.dataset.size
    );

    if (!item) return;

    item.quantity += Number(quantityButton.dataset.qty);

    if (item.quantity <= 0) {
      cart = cart.filter(cartItem => cartItem !== item);
    }

    renderCart();
  }

  if (removeButton) {
    cart = cart.filter(item =>
      !(
        item.id === Number(removeButton.dataset.remove) &&
        item.size === removeButton.dataset.size
      )
    );

    renderCart();
  }
});

// Product popup size selection and add-to-cart
$("product-details").addEventListener("click", event => {
  const sizeButton = event.target.closest("[data-size]");

  if (sizeButton) {
    chosenSize = sizeButton.dataset.size;

    document.querySelectorAll(".size-option").forEach(button => {
      button.classList.toggle("selected", button === sizeButton);
    });
  }

  if (event.target.closest("#detail-add")) {
    const product = products.find(item => item.id === currentDetailId);

    if (!product) return;

    addToCart(
      product.id,
      product.sizes.length ? chosenSize : ""
    );

    $("product-dialog").close();
  }
});

// Close product popup
$("close-product").addEventListener("click", () => {
  $("product-dialog").close();
});

// Checkout
$("checkout-button").addEventListener("click", () => {
  if (!cart.length) return;

  closeCart();
  $("checkout-form").hidden = false;
  $("order-success").hidden = true;

  $("checkout-dialog").showModal();
});

$("close-checkout").addEventListener("click", () => {
  $("checkout-dialog").close();
});

$("checkout-form").addEventListener("submit", event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);
  const name = escapeHTML(form.get("name"));
  const orderNumber = "NX" + Date.now().toString().slice(-7);

  $("order-success").innerHTML = `
    <h3>✓ Demo Order Placed!</h3>
    Thank you, ${name}.<br>
    Your demo order number is <strong>${orderNumber}</strong>.<br><br>
    <button class="primary-btn full-btn" id="finish-order">
      Continue Shopping
    </button>
  `;

  $("checkout-form").hidden = true;
  $("order-success").hidden = false;

  cart = [];
  renderCart();

  $("finish-order").addEventListener("click", () => {
    $("checkout-dialog").close();
    $("checkout-form").reset();
  });
});

// Initial page setup
$("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
