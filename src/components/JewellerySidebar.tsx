import { useState, useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jewelleryItems, type JewelleryCategory, type JewelleryItem } from "@/data/jewellery";
import CategoryTabs from "@/components/sidebar/CategoryTabs";
import ItemGrid from "@/components/sidebar/ItemGrid";
import UploadButton from "@/components/sidebar/UploadButton";

interface JewellerySidebarProps {
  selectedIds: ReadonlySet<string>;
  onToggleItem: (item: JewelleryItem) => void;
}

const trackingHint: Record<JewelleryCategory, string> = {
  earrings: "👂 Face your camera — tracks ears automatically",
  necklaces: "💎 Face your camera — tracks your neckline",
  rings: "💍 Show your hand palm-up to the camera",
  bracelets: "⌚ Show your wrist to the camera",
  glasses: "👓 Face your camera — tracks your eyes & nose",
};

const guideSteps = [
  "Enable your camera.",
  "Select one or more pieces from the collection.",
  "Face the camera or show your hand for live tracking.",
  "Tap a selected piece again to remove it.",
  "Capture a photo with all visible jewellery included.",
];

const JewellerySidebar = ({ selectedIds, onToggleItem }: JewellerySidebarProps) => {
  const [activeCategory, setActiveCategory] = useState<JewelleryCategory>("earrings");
  const [customItems, setCustomItems] = useState<JewelleryItem[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const filtered = useMemo(
    () => [...jewelleryItems, ...customItems].filter((item) => item.category === activeCategory),
    [activeCategory, customItems],
  );

  const handleCustomUpload = (item: JewelleryItem) => {
    setCustomItems((current) => [...current, item]);
    onToggleItem(item);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg text-foreground">Collection</h3>
          <p className="text-muted-foreground text-xs font-body mt-1">Tap a piece to add or remove it</p>
        </div>
        <button
          onClick={() => setShowGuide((shown) => !shown)}
          className="p-2 rounded-sm hover:bg-secondary transition-colors"
          aria-label={showGuide ? "Hide instructions" : "Show instructions"}
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

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
              {guideSteps.map((step, index) => (
                <p key={step} className="text-[10px] sm:text-xs font-body text-muted-foreground">
                  {index + 1}. {step}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      <div className="px-3 py-2 border-b border-border bg-secondary/50">
        <p className="text-[10px] sm:text-xs font-body text-muted-foreground text-center">
          {trackingHint[activeCategory]}
        </p>
      </div>
      <ItemGrid
        items={filtered}
        activeCategory={activeCategory}
        selectedIds={selectedIds}
        onSelect={onToggleItem}
      />
      <UploadButton activeCategory={activeCategory} onUpload={handleCustomUpload} />
    </div>
  );
};

export default JewellerySidebar;
