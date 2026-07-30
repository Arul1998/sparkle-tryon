import { useState, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jewelleryItems, type JewelleryCategory, type JewelleryItem } from "@/data/jewellery";
import CategoryTabs from "@/components/sidebar/CategoryTabs";
import ItemGrid from "@/components/sidebar/ItemGrid";
import UploadButton from "@/components/sidebar/UploadButton";

interface JewellerySidebarProps {
  onSelectItem: (item: JewelleryItem) => void;
}

const trackingHint: Record<JewelleryCategory, string> = {
  earrings: "👂 Face your camera — tracks ears automatically",
  necklaces: "💎 Face your camera — tracks your neckline",
  rings: "💍 Show your hand palm-up to the camera",
  bracelets: "⌚ Show your wrist to the camera",
  glasses: "👓 Face your camera — tracks your eyes & nose",
};

const guideSteps = [
  "1. Enable your camera by clicking the button",
  "2. Select a jewellery piece from the collection",
  "3. Face the camera (for earrings/necklaces) or show your hand (for rings/bracelets)",
  "4. The jewellery will appear on you in real-time!",
  "5. Use the capture button to save a photo",
];

const JewellerySidebar = ({ onSelectItem }: JewellerySidebarProps) => {
  const [activeCategory, setActiveCategory] = useState<JewelleryCategory>("earrings");
  const [customItems, setCustomItems] = useState<JewelleryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showGuide, setShowGuide] = useState(false);

  const filtered = useMemo(() => {
    const allItems = [...jewelleryItems, ...customItems];
    return allItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, customItems]);

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

  const handleCustomUpload = (item: JewelleryItem) => {
    setCustomItems((prev) => [...prev, item]);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-foreground">Collection</h3>
          <p className="text-muted-foreground text-xs font-body mt-1">
            Tap a piece to try it on
          </p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="p-2 rounded-sm hover:bg-secondary transition-colors"
          title="How to use"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* How-to Guide */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border"
          >
            <div className="p-3 bg-secondary/50 space-y-1.5">
              <p className="text-xs font-body font-medium text-foreground">How to use AR Try-On</p>
              {guideSteps.map((step, i) => (
                <p key={i} className="text-[10px] sm:text-xs font-body text-muted-foreground">{step}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Tracking hint */}
      <div className="px-3 py-2 border-b border-border bg-secondary/50">
        <p className="text-[10px] sm:text-xs font-body text-muted-foreground text-center">
          {trackingHint[activeCategory]}
        </p>
      </div>

      <ItemGrid
        items={filtered}
        activeCategory={activeCategory}
        selectedIds={selectedIds}
        onSelect={handleSelect}
      />

      <UploadButton activeCategory={activeCategory} onUpload={handleCustomUpload} />
    </div>
  );
};

export default JewellerySidebar;
