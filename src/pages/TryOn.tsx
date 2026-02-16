import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, Trash2 } from "lucide-react";
import CameraView from "@/components/CameraView";
import JewellerySidebar from "@/components/JewellerySidebar";
import ARJewelleryOverlay from "@/components/ARJewelleryOverlay";
import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { JewelleryItem } from "@/data/jewellery";

const TryOn = () => {
  const navigate = useNavigate();
  const [activePieces, setActivePieces] = useState<JewelleryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [mirrored] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectItem = useCallback((item: JewelleryItem) => {
    setActivePieces((prev) => {
      // Replace if same category already active, or add
      const existing = prev.find((p) => p.category === item.category && p.id === item.id);
      if (existing) return prev;
      // Allow multiple of different items
      return [...prev, item];
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setActivePieces((prev) => prev.filter((p) => p.id !== itemId));
  }, []);

  const handleLandmarksUpdate = useCallback((l: FaceLandmarks | null) => {
    setLandmarks(l);
  }, []);

  const containerWidth = containerRef.current?.clientWidth ?? 0;
  const containerHeight = containerRef.current?.clientHeight ?? 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border glass-dark z-30 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="font-display text-lg text-foreground">
          <span className="text-gold-gradient">Jewel</span> AR Try-On
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Camera + AR overlays */}
        <div className="flex-1 relative" ref={containerRef}>
          <CameraView onLandmarksUpdate={handleLandmarksUpdate}>
            {landmarks &&
              activePieces.map((item) => (
                <ARJewelleryOverlay
                  key={item.id}
                  item={item}
                  landmarks={landmarks}
                  containerWidth={containerWidth}
                  containerHeight={containerHeight}
                  mirrored={mirrored}
                />
              ))}

            {/* No face warning when pieces are active */}
            {!landmarks && activePieces.length > 0 && (
              <div className="absolute inset-x-0 bottom-16 flex justify-center z-20">
                <div className="glass-dark px-4 py-2.5 rounded-sm border border-gold/20">
                  <p className="text-foreground text-sm font-body text-center">
                    Position your face in the camera to see jewellery
                  </p>
                </div>
              </div>
            )}
          </CameraView>

          {/* Active pieces strip */}
          {activePieces.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 z-20">
              <div className="glass-dark rounded-sm border border-border p-2 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-body text-muted-foreground shrink-0 px-2">
                  Wearing:
                </span>
                {activePieces.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 flex items-center gap-2 bg-secondary rounded-sm px-2 py-1.5 group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-xs font-body text-foreground">{item.name}</span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {activePieces.length > 1 && (
                  <button
                    onClick={() => setActivePieces([])}
                    className="text-xs font-body text-gold hover:text-gold-light transition-colors shrink-0 px-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 border-l border-border">
            <JewellerySidebar onSelectItem={handleSelectItem} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOn;
