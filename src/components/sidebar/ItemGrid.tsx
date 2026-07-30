import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check } from "lucide-react";
import type { JewelleryItem, JewelleryCategory } from "@/data/jewellery";

interface ItemGridProps {
  items: JewelleryItem[];
  activeCategory: JewelleryCategory;
  selectedIds: Set<string>;
  onSelect: (item: JewelleryItem) => void;
}

const ItemGrid = ({ items, activeCategory, selectedIds, onSelect }: ItemGridProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-2 gap-2 sm:gap-3"
        >
          {items.map((item) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(item)}
                className={`group relative bg-secondary rounded-sm overflow-hidden border transition-all ${
                  isSelected
                    ? "border-gold shadow-gold"
                    : "border-border hover:border-gold/40"
                }`}
              >
                <div className="aspect-square p-3 flex items-center justify-center bg-secondary">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
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
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ItemGrid;
