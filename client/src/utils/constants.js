export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Mirrors the `sport` field on the Product schema
export const SPORTS = [
  "Badminton",
  "Basketball",
  "Cricket",
  "Fitness",
  "Football",
  "Tennis",
];

// Mirrors the `type` field on the Product schema
export const PRODUCT_TYPES = [
  "Accessory",
  "Bag",
  "Bat",
  "Ball",
  "Cap",
  "Gloves",
  "Net",
  "Racket",
  "Shoes",
];

export const SORT_OPTIONS = [
  { value: "relevant", label: "Relevant" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best Selling" },
  { value: "rating", label: "Highest Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Discount" },
];

export const PAGE_SIZE = 15;
