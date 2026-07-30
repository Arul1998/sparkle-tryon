import { useState, useRef } from "react";
import { Upload, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jewelleryItems, categories, type JewelleryCategory, type JewelleryItem } from "@/data/jewellery";

interface JewellerySidebarProps {
  onSelectItem: (item: JewelleryItem) => void;
}

const JewellerySidebar = ({ onSelectItem }: JewellerySidebarProps) => {
  const [activeCategory, setActiveCategory] = useState<JewelleryCategory>("earrings");
  const [customItems, setCustomItems] = useState<JewelleryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allItems = [...jewelleryItems, ...customItems];
  const filtered = allItems.filter((item) => item.category === activeCategory);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newItem: JewelleryItem = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        category: activeCategory,
        image: reader.result as string,
        price: "Custom",
      };
      setCustomItems((prev) => [...prev, newItem]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg text-foreground">Collection</h3>
        <p className="text-muted-foreground text-xs font-body mt-1">
          Select pieces to try on
        </p>
      </div>

      {/* Categories */}
      <div className="flex border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex-1 py-3 text-xs font-body tracking-wider uppercase transition-colors ${
              activeCategory === cat.value
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="block text-lg mb-0.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-3"
          >
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group relative bg-secondary rounded-sm overflow-hidden border border-border hover:border-gold/40 transition-all"
              >
                <div className="aspect-square p-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 text-left">
                  <p className="text-foreground text-xs font-body truncate">{item.name}</p>
                  <p className="text-gold text-xs font-body">{item.price}</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-6 h-6 text-gold" />
                </div>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Upload Button */}
      <div className="p-3 border-t border-border">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-sm border border-dashed border-gold/30 text-gold text-xs font-body tracking-wider uppercase hover:bg-gold/5 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Your Piece
        </button>
      </div>
    </div>
  );
};

export default JewellerySidebar;
