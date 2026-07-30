import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { JewelleryItem, JewelleryCategory } from "@/data/jewellery";

interface UploadButtonProps {
  activeCategory: JewelleryCategory;
  onUpload: (item: JewelleryItem) => void;
}

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const UploadButton = ({ activeCategory, onUpload }: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Use a PNG, JPEG or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("The image could not be read.");
        return;
      }
      onUpload({
        id: `custom-${crypto.randomUUID()}`,
        name: file.name.replace(/\.[^.]+$/, ""),
        category: activeCategory,
        image: reader.result,
        price: "Custom",
      });
      setError(null);
    };
    reader.onerror = () => setError("The image could not be read.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-3 border-t border-border">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleUpload}
        className="hidden"
        aria-label="Upload a custom jewellery image"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-sm border border-dashed border-gold/30 text-gold text-[10px] sm:text-xs font-body tracking-wider uppercase hover:bg-gold/5 transition-colors"
      >
        <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        Upload Your Piece
      </button>
      {error && <p className="mt-2 text-xs text-destructive font-body" role="alert">{error}</p>}
    </div>
  );
};

export default UploadButton;
