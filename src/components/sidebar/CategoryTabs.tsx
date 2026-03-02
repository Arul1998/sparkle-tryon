import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { categories, type JewelleryCategory } from "@/data/jewellery";

interface CategoryTabsProps {
  activeCategory: JewelleryCategory;
  onCategoryChange: (category: JewelleryCategory) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
      {categories.map((cat) => (
        <Tooltip key={cat.value}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onCategoryChange(cat.value)}
              className={`flex-shrink-0 flex-1 min-w-0 py-2.5 sm:py-3 text-[10px] sm:text-xs font-body tracking-wider uppercase transition-colors ${
                activeCategory === cat.value
                  ? "text-gold border-b-2 border-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="block text-base sm:text-lg mb-0.5">{cat.icon}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="sm:hidden">
            {cat.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default CategoryTabs;
