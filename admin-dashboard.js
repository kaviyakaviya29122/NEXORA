import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


const CLOUDINARY_CLOUD_NAME = "ij1gcqoh";
const CLOUDINARY_UPLOAD_PRESET = "nexora_products";


import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Your Firebase Authentication admin UID
const ADMIN_UID = "c6ZwJiXMHfR81KFuX3e1CmpkmKI3";

const emailElement = document.getElementById("admin-email");
const messageElement = document.getElementById("dashboard-message");
const logoutButton = document.getElementById("logout-button");

const addForm = document.getElementById("add-product-form");
const addMessage = document.getElementById("add-product-message");
const viewButton = document.getElementById("view-products");
const productsMessage = document.getElementById("products-message");
const productsList = document.getElementById("products-list");

let verifiedAdmin = false;

// Verify admin login
onAuthStateChanged(auth, (user) => {
  verifiedAdmin = false;

  if (!user) {
    if (emailElement) emailElement.textContent = "Not logged in";
    if (messageElement) {
      messageElement.textContent = "Please log in again.";
    }

    window.location.href = "./admin.html";
    return;
  }

  if (emailElement) {
    emailElement.textContent = "Signed in as: " + (user.email || "");
  }

  if (user.uid !== ADMIN_UID) {
    if (messageElement) {
      messageElement.textContent =
        "Access denied: this account is not an admin.";
    }
    return;
  }

  verifiedAdmin = true;

  if (messageElement) {
    messageElement.textContent =
      "Admin verified. Dashboard is ready.";
  }

  loadProducts();
});

// Logout
logoutButton?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./admin.html";
  } catch (error) {
    console.error("Logout error:", error);

    if (messageElement) {
      messageElement.textContent = "Logout failed. Please try again.";
    }
  }
});

// Load existing products
async function loadProducts() {
  if (!verifiedAdmin) return;

  productsMessage.textContent = "Loading products...";
  productsList.replaceChildren();

  try {
    const snapshot = await getDocs(collection(db, "products"));

    if (snapshot.empty) {
      productsMessage.textContent = "No products found in Firestore.";
      return;
    }

    productsMessage.textContent = `Products found: ${snapshot.size}`;

    snapshot.forEach((productDoc) => {
      const product = productDoc.data();

      const card = document.createElement("div");
      card.style.cssText =
        "border:1px solid #ddd;padding:14px;margin:12px 0;border-radius:10px";

      // Show saved image, if available
      if (product.image) {
        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name || "Product image";
        image.style.cssText =
          "width:120px;height:120px;object-fit:contain;display:block;margin-bottom:12px";

        card.appendChild(image);
      }

      const nameLabel = document.createElement("label");
      nameLabel.textContent = "Product: ";

      const nameInput = document.createElement("input");
      nameInput.value = product.name || product.title || "";
      nameInput.placeholder = "Product name";
      nameInput.setAttribute("aria-label", "Product name");

      const priceLabel = document.createElement("label");
      priceLabel.textContent = "Price (₹): ";

      const priceInput = document.createElement("input");
      priceInput.type = "number";
      priceInput.min = "0.01";
      priceInput.step = "0.01";
      priceInput.value = product.price ?? "";
      priceInput.placeholder = "Price";
      priceInput.setAttribute("aria-label", "Product price");

      const categoryLabel = document.createElement("label");
      categoryLabel.textContent = "Category: ";

      const categorySelect = document.createElement("select");
      categorySelect.setAttribute("aria-label", "Product category");

      [
        ["men", "Men"],
        ["women", "Women"],
        ["kids", "Kids"],
        ["electronics", "Electronics"]
      ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        categorySelect.appendChild(option);
      });

      const savedCategory = String(product.category || "").toLowerCase();

      categorySelect.value = [
        "men",
        "women",
        "kids",
        "electronics"
      ].includes(savedCategory)
        ? savedCategory
        : "men";

      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.className = "dashboard-button";
      saveButton.textContent = "Save Changes";

      saveButton.addEventListener("click", async () => {
        if (!verifiedAdmin) return;

        const name = nameInput.value.trim();
        const price = Number(priceInput.value);
        const category = categorySelect.value;

        if (!name || !Number.isFinite(price) || price <= 0) {
          alert("Enter a product name and a valid price.");
          return;
        }

        try {
          await updateDoc(doc(db, "products", productDoc.id), {
            name,
            price,
            category
          });

          alert("Product updated successfully.");
          await loadProducts();
        } catch (error) {
          console.error("Update product error:", error);
          alert("Update failed. Check Firestore Rules.");
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "dashboard-button";
      deleteButton.style.background = "#b91c1c";
      deleteButton.style.marginLeft = "8px";
      deleteButton.textContent = "Delete";

      deleteButton.addEventListener("click", async () => {
        if (!verifiedAdmin) return;

        if (!confirm(
          `Delete "${nameInput.value}"? This cannot be undone.`
        )) {
          return;
        }

        try {
          await deleteDoc(doc(db, "products", productDoc.id));

          alert("Product deleted.");
          await loadProducts();
        } catch (error) {
          console.error("Delete product error:", error);
          alert("Delete failed. Check Firestore Rules.");
        }
      });

      card.append(
        nameLabel,
        nameInput,
        document.createElement("br"),
        priceLabel,
        priceInput,
        document.createElement("br"),
        categoryLabel,
        categorySelect,
        document.createElement("br"),
        saveButton,
        deleteButton
      );

      productsList.appendChild(card);
    });
  } catch (error) {
    console.error("Product loading error:", error);

    productsMessage.textContent =
      "Could not load products. Check Firestore Rules and Console.";
  }
}

// Add product with image upload

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!verifiedAdmin || !auth.currentUser ||
      auth.currentUser.uid !== ADMIN_UID) {
    addMessage.textContent =
      "Admin verification is required. Please log in again.";
    return;
  }

  const name = document
    .getElementById("new-product-name").value.trim();

  const price = Number(
    document.getElementById("new-product-price").value
  );

  const category = document
    .getElementById("new-product-category").value;

  const imageFile = document
    .getElementById("new-product-image")?.files?.[0];

  if (!name || !Number.isFinite(price) ||
      price <= 0 || !category) {
    addMessage.textContent =
      "Enter a product name, valid price, and category.";
    return;
  }

  if (!imageFile || !imageFile.type.startsWith("image/")) {
    addMessage.textContent = "Please select a valid product image.";
    return;
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    addMessage.textContent = "Image size must be under 5 MB.";
    return;
  }

  const submitButton =
    addForm.querySelector('button[type="submit"]');

  try {
    if (submitButton) submitButton.disabled = true;

    addMessage.textContent = "Uploading product image...";

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "nexora_products");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const result = await response.json();
    console.log("Cloudinary response:", result);

    if (!response.ok) {
      throw new Error(
        result.error?.message || "Image upload failed."
      );
    }

    if (!result.secure_url) {
      throw new Error("Image URL was not received.");
    }

    addMessage.textContent = "Saving product details...";

    await addDoc(collection(db, "products"), {
      name: name,
      price: price,
      category: category,
      image: result.secure_url
    });

    addMessage.textContent =
      "Product and image added successfully!";

    addForm.reset();
    await loadProducts();

  } catch (error) {
    console.error("Add product error:", error);
    addMessage.textContent =
      "Could not add product: " + error.message;

  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

// Refresh product list
viewButton.addEventListener("click", loadProducts);
