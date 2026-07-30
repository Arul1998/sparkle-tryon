import earring1 from "@/assets/earring-1.png";
import earring2 from "@/assets/earring-2.png";
import necklace1 from "@/assets/necklace-1.png";
import necklace2 from "@/assets/necklace-2.png";
import ring1 from "@/assets/ring-1.png";
import bracelet1 from "@/assets/bracelet-1.png";
import glasses1 from "@/assets/glasses-1.png";
import glasses2 from "@/assets/glasses-2.png";
import glasses3 from "@/assets/glasses-3.png";

export type JewelleryCategory = "earrings" | "necklaces" | "rings" | "bracelets" | "glasses";

export interface JewelleryItem {
  id: string;
  name: string;
  category: JewelleryCategory;
  image: string;
  price: string;
}

export const jewelleryItems: JewelleryItem[] = [
  { id: "e1", name: "Diamond Drop Earring", category: "earrings", image: earring1, price: "$2,450" },
  { id: "e2", name: "Pearl Hoop Earring", category: "earrings", image: earring2, price: "$1,890" },
  { id: "n1", name: "Gold Pendant Necklace", category: "necklaces", image: necklace1, price: "$3,200" },
  { id: "n2", name: "Rose Gold Layered Chain", category: "necklaces", image: necklace2, price: "$2,750" },
  { id: "r1", name: "Diamond Solitaire Ring", category: "rings", image: ring1, price: "$5,800" },
  { id: "b1", name: "Gold Cuban Bracelet", category: "bracelets", image: bracelet1, price: "$1,650" },
  { id: "g1", name: "Classic Wayfarer", category: "glasses", image: glasses1, price: "$320" },
  { id: "g2", name: "Gold Aviator", category: "glasses", image: glasses2, price: "$450" },
  { id: "g3", name: "Round Tortoiseshell", category: "glasses", image: glasses3, price: "$280" },
];

export const categories: { value: JewelleryCategory; label: string; icon: string }[] = [
  { value: "earrings", label: "Earrings", icon: "✦" },
  { value: "necklaces", label: "Necklaces", icon: "◇" },
  { value: "rings", label: "Rings", icon: "○" },
  { value: "bracelets", label: "Bracelets", icon: "◎" },
  { value: "glasses", label: "Glasses", icon: "👓" },
];
