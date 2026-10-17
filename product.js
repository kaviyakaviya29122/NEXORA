
console.log("product.js started!");

import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const container = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const sortSelect = document.querySelector("#sort-products");
const priceRange = document.querySelector("#price-range");
const priceValue = document.querySelector("#price-value");
const sizeFilter = document.querySelector("#size-filter");
const resetButton = document.querySelector("#reset-filters");
const resultCount = document.querySelector("#result-count");
const emptyResults = document.querySelector("#empty-results");
const categoryButtons = document.querySelectorAll(
  ".categories button[data-category]"
);

let allProducts = [];
let selectedCategory = "all";

function normalizeCategory(value) {
  const category = String(value || "").trim().toLowerCase();

  const categoryMap = {
    men: "men",
    male: "men",
    menwear: "men",
    mens: "men",
    women: "women",
    female: "women",
    womens: "women",
    kids: "kids",
    kid: "kids",
    children: "kids",
    child: "kids",
    electronics: "electronics",
    electronic: "electronics"
  };

  return categoryMap[category] || category;
}

async function loadProducts() {
  if (!container) {
    console.error("Product grid not found!");
    return;
  }

  container.innerHTML = "<p>Loading products...</p>";

  try {
    const snapshot = await getDocs(collection(db, "products"));

    allProducts = snapshot.docs.map((productDoc) => {
      const data = productDoc.data();

      return {
        id: productDoc.id,
        name: data.name || data.title || "Product",
        price: Number(data.price) || 0,
        category: normalizeCategory(data.category),
        image: data.image || "",
        size: String(data.size || "all").toUpperCase()
      };
    });

    console.log("Products loaded:", allProducts.length);
    console.table(
      allProducts.map((product) => ({
        name: product.name,
        category: product.category,
        price: product.price
      }))
    );

    renderProducts();
  } catch (error) {
    console.error("Products loading failed:", error);
    container.innerHTML =
      "<p>Products could not be loaded. Please refresh the page.</p>";
  }
}

function renderProducts() {
  const searchText = (searchInput?.value || "").trim().toLowerCase();
  const maxPrice = Number(priceRange?.value || 50000);
  const selectedSize = sizeFilter?.value || "all";
  const sortValue = sortSelect?.value || "featured";

  let filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    const matchesSearch = product.name.toLowerCase().includes(searchText);

    const matchesPrice = product.price <= maxPrice;

    const matchesSize =
      selectedSize === "all" ||
      product.size === selectedSize ||
      product.size === "ALL";

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesSize
    );
  });

  if (sortValue === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  container.innerHTML = "";

  filteredProducts.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.category = product.category;

    const image = document.createElement("img");
    image.alt = product.name;
    image.loading = "lazy";
    image.style.width = "100%";
    image.style.height = "200px";
    image.style.objectFit = "contain";

    image.src = product.image || "images/tshirt.jpg";

    image.onerror = () => {
      image.onerror = null;
      image.alt = "Product image unavailable";
    };

    const title = document.createElement("h3");
    title.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = `₹${product.price.toLocaleString("en-IN")}`;

    card.append(image, title, price);
    container.appendChild(card);
  });

  if (resultCount) {
    resultCount.textContent =
      `${filteredProducts.length} product(s) found`;
  }

  if (emptyResults) {
    emptyResults.hidden = filteredProducts.length !== 0;
  }

  console.log(
    `Category: ${selectedCategory}; displayed: ${filteredProducts.length}`
  );
}

// Category buttons
categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = normalizeCategory(button.dataset.category);

    categoryButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderProducts();
  });
});

// Search
searchInput?.addEventListener("input", renderProducts);

// Sorting
sortSelect?.addEventListener("change", renderProducts);

// Maximum price
priceRange?.addEventListener("input", () => {
  if (priceValue) {
    priceValue.textContent =
      `₹${Number(priceRange.value).toLocaleString("en-IN")}`;
  }

  renderProducts();
});

// Size filter
sizeFilter?.addEventListener("change", renderProducts);

// Reset filters
resetButton?.addEventListener("click", () => {
  selectedCategory = "all";

  if (searchInput) searchInput.value = "";
  if (sortSelect) sortSelect.value = "featured";
  if (priceRange) priceRange.value = priceRange.max;
  if (priceValue) {
    priceValue.textContent =
      `₹${Number(priceRange?.max || 50000).toLocaleString("en-IN")}`;
  }
  if (sizeFilter) sizeFilter.value = "all";

  categoryButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.category === "all"
    );
  });

  renderProducts();
});

loadProducts();
