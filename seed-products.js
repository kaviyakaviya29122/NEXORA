
import { db } from "./firebase.js";
import {
  doc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const products = [
  { id: "men-casual-shirt", name: "Men Casual Shirt", price: 1299, category: "men" },
  { id: "men-slim-fit-jeans", name: "Men Slim Fit Jeans", price: 1799, category: "men" },
  { id: "men-casual-shoes", name: "Men Casual Shoes", price: 2199, category: "men" },
  { id: "men-classic-watch", name: "Men Classic Watch", price: 2999, category: "men" },

  { id: "women-elegant-dress", name: "Women Elegant Dress", price: 1499, category: "women" },
  { id: "women-premium-handbag", name: "Women Premium Handbag", price: 1899, category: "women" },
  { id: "women-fashion-footwear", name: "Women Fashion Footwear", price: 2299, category: "women" },
  { id: "women-classic-watch", name: "Women Classic Watch", price: 2799, category: "women" },

  { id: "kids-t-shirt", name: "Kids T-Shirt", price: 599, category: "kids" },
  { id: "kids-fashion-dress", name: "Kids Fashion Dress", price: 899, category: "kids" },
  { id: "kids-casual-shoes", name: "Kids Casual Shoes", price: 999, category: "kids" },
  { id: "kids-smart-watch", name: "Kids Smart Watch", price: 1499, category: "kids" },

  { id: "running-shoes", name: "Running Shoes", price: 1999, category: "men" },
  { id: "wireless-headphones", name: "Wireless Headphones", price: 2499, category: "electronics" },
  { id: "smart-laptop", name: "Smart Laptop", price: 45999, category: "electronics" },
  { id: "smartphone", name: "Smartphone", price: 12999, category: "electronics" },
  { id: "wireless-mouse", name: "Wireless Mouse", price: 699, category: "electronics" },
  { id: "wireless-earbuds", name: "Wireless Earbuds", price: 1499, category: "electronics" }
];

async function addProducts() {
  try {
    const batch = writeBatch(db);

    products.forEach((product) => {
      const productRef = doc(db, "products", product.id);

      batch.set(productRef, {
        name: product.name,
        price: product.price,
        category: product.category,
        isActive: true
      });
    });

    await batch.commit();

    console.log(`Success! ${products.length} products added to Firebase.`);
    alert(`${products.length} products successfully added!`);
  } catch (error) {
    console.error("Product upload failed:", error);
    alert("Upload failed. Console-ல் error பாருங்க.");
  }
}

addProducts();
