import { useRef } from "react";
import { Upload } from "lucide-react";
import type { JewelleryItem, JewelleryCategory } from "@/data/jewellery";

interface UploadButtonProps {
  activeCategory: JewelleryCategory;
  onUpload: (item: JewelleryItem) => void;
}

const UploadButton = ({ activeCategory, onUpload }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onUpload(newItem);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
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
  );
};

export default UploadButton;
