import { useState, useRef } from "react";
import { Upload, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jewelleryItems, categories, type JewelleryCategory, type JewelleryItem } from "@/data/jewellery";

interface JewellerySidebarProps {
  onSelectItem: (item: JewelleryItem) => void;
}

const JewellerySidebar = ({ onSelectItem }: JewellerySidebarProps) => {
  const [activeCategory, setActiveCategory] = useState<JewelleryCategory>("earrings");
  const [customItems, setCustomItems] = useState<JewelleryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allItems = [...jewelleryItems, ...customItems];
  const filtered = allItems.filter((item) => item.category === activeCategory);

  const handleSelect = (item: JewelleryItem) => {
    onSelectItem(item);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
      }
      return next;
    });
  };

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

  // Tracking hint per category
  const trackingHint: Record<JewelleryCategory, string> = {
    earrings: "Tracks your ears via face detection",
    necklaces: "Tracks your neck via face detection",
    rings: "Tracks your hand — show your hand to camera",
    bracelets: "Tracks your wrist — show your hand to camera",
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg text-foreground">Collection</h3>
        <p className="text-muted-foreground text-xs font-body mt-1">
          Tap a piece to try it on
        </p>
      </div>

      {/* Categories */}
      <div className="flex border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex-1 py-2.5 sm:py-3 text-[10px] sm:text-xs font-body tracking-wider uppercase transition-colors ${
              activeCategory === cat.value
                ? "text-gold border-b-2 border-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="block text-base sm:text-lg mb-0.5">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tracking hint */}
      <div className="px-3 py-2 border-b border-border bg-secondary/50">
        <p className="text-[10px] sm:text-xs font-body text-muted-foreground text-center">
          {trackingHint[activeCategory]}
        </p>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            {filtered.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`group relative bg-secondary rounded-sm overflow-hidden border transition-all ${
                    isSelected
                      ? "border-gold shadow-gold"
                      : "border-border hover:border-gold/40"
                  }`}
                >
                  <div className="aspect-square p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5 sm:p-2 text-left">
                    <p className="text-foreground text-[10px] sm:text-xs font-body truncate">{item.name}</p>
                    <p className="text-gold text-[10px] sm:text-xs font-body">{item.price}</p>
                  </div>
                  {isSelected ? (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-5 h-5 text-gold" />
                    </div>
                  )}
                </button>
              );
            })}
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
          className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-sm border border-dashed border-gold/30 text-gold text-[10px] sm:text-xs font-body tracking-wider uppercase hover:bg-gold/5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Upload Your Piece
        </button>
      </div>
    </div>
  );
};

export default JewellerySidebar;
