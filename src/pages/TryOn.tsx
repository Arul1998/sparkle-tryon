import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import CameraView from "@/components/CameraView";
import JewellerySidebar from "@/components/JewellerySidebar";
import JewelleryOverlay from "@/components/JewelleryOverlay";
import type { JewelleryItem } from "@/data/jewellery";

interface ActivePiece {
  id: string;
  item: JewelleryItem;
}

const TryOn = () => {
  const navigate = useNavigate();
  const [activePieces, setActivePieces] = useState<ActivePiece[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSelectItem = useCallback((item: JewelleryItem) => {
    setActivePieces((prev) => [
      ...prev,
      { id: `${item.id}-${Date.now()}`, item },
    ]);
  }, []);

  const handleRemovePiece = useCallback((pieceId: string) => {
    setActivePieces((prev) => prev.filter((p) => p.id !== pieceId));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-dark z-30">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="font-display text-lg text-foreground">
          <span className="text-gold-gradient">AR</span> Try-On
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors lg:hidden"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="hidden lg:block w-16" />
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Camera */}
        <div className="flex-1 relative">
          <CameraView>
            {activePieces.map((piece) => (
              <JewelleryOverlay
                key={piece.id}
                item={piece.item}
                onRemove={() => handleRemovePiece(piece.id)}
              />
            ))}
          </CameraView>

          {/* Active pieces count */}
          {activePieces.length > 0 && (
            <div className="absolute bottom-4 left-4 glass-dark px-4 py-2 rounded-sm border border-border">
              <p className="text-foreground text-xs font-body">
                {activePieces.length} piece{activePieces.length !== 1 ? "s" : ""} active
                <button
                  onClick={() => setActivePieces([])}
                  className="ml-3 text-gold hover:text-gold-light transition-colors"
                >
                  Clear all
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className={`w-72 shrink-0 transition-all duration-300 ${
            sidebarOpen
              ? "translate-x-0"
              : "translate-x-full absolute right-0 top-0 bottom-0 z-20 lg:translate-x-full"
          }`}
        >
          <JewellerySidebar onSelectItem={handleSelectItem} />
        </div>
      </div>
    </div>
  );
};

export default TryOn;
