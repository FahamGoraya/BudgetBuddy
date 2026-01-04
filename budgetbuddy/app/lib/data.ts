import { Category } from "../types";

// Categories aligned with Veryfi API vendor_type for consistent expense categorization
export const defaultCategories: Category[] = [
  { id: "1", name: "Restaurant", color: "#FF6384" },
  { id: "2", name: "Fast Food", color: "#FF9F40" },
  { id: "3", name: "Coffee", color: "#8B4513" },
  { id: "4", name: "Grocery", color: "#4BC0C0" },
  { id: "5", name: "Food", color: "#FFCE56" },
  { id: "6", name: "Bakery", color: "#DEB887" },
  { id: "7", name: "Transportation", color: "#36A2EB" },
  { id: "8", name: "Taxi", color: "#FFD700" },
  { id: "9", name: "Airlines", color: "#87CEEB" },
  { id: "10", name: "Fuel", color: "#DC143C" },
  { id: "11", name: "Parking", color: "#708090" },
  { id: "12", name: "Car Repair", color: "#B22222" },
  { id: "13", name: "Auto Parts", color: "#8B0000" },
  { id: "14", name: "Online Shopping", color: "#9966FF" },
  { id: "15", name: "Department Store", color: "#FF69B4" },
  { id: "16", name: "Convenience", color: "#20B2AA" },
  { id: "17", name: "Utilities", color: "#6B8E23" },
  { id: "18", name: "Hotel", color: "#DAA520" },
  { id: "19", name: "Health", color: "#32CD32" },
  { id: "20", name: "Drugstore / Pharmacy", color: "#00CED1" },
  { id: "21", name: "Hardware", color: "#A0522D" },
  { id: "22", name: "Building Supplies", color: "#CD853F" },
  { id: "23", name: "Office Equipment", color: "#4682B4" },
  { id: "24", name: "Nurseries & Gardening", color: "#228B22" },
  { id: "25", name: "General Contractor", color: "#696969" },
  { id: "26", name: "Other", color: "#607D8B" },
];

// Map Veryfi vendor_type to our category names (case-insensitive matching)
export const veryfiCategoryMap: Record<string, string> = {
  "restaurant": "Restaurant",
  "fast food": "Fast Food",
  "coffee": "Coffee",
  "grocery": "Grocery",
  "food": "Food",
  "bakery": "Bakery",
  "transportation": "Transportation",
  "taxi": "Taxi",
  "airlines": "Airlines",
  "fuel": "Fuel",
  "parking": "Parking",
  "car repair": "Car Repair",
  "auto parts": "Auto Parts",
  "online shopping": "Online Shopping",
  "department store": "Department Store",
  "convenience": "Convenience",
  "utilities": "Utilities",
  "hotel": "Hotel",
  "health": "Health",
  "drugstore / pharmacy": "Drugstore / Pharmacy",
  "hardware": "Hardware",
  "building supplies": "Building Supplies",
  "office equipment": "Office Equipment",
  "nurseries & gardening": "Nurseries & Gardening",
  "general contractor": "General Contractor",
  "other": "Other",
};

// Helper function to map Veryfi category to our category
export const mapVeryfiCategory = (veryfiCategory: string | undefined): string => {
  if (!veryfiCategory) return "Other";
  const normalized = veryfiCategory.toLowerCase().trim();
  return veryfiCategoryMap[normalized] || "Other";
};
