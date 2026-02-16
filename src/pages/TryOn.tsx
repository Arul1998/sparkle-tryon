import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, Trash2, Camera as CameraIcon, Download } from "lucide-react";
import CameraView, { type TrackingData } from "@/components/CameraView";
import JewellerySidebar from "@/components/JewellerySidebar";
import ARJewelleryOverlay from "@/components/ARJewelleryOverlay";
import type { FaceLandmarks } from "@/hooks/useFaceLandmarks";
import type { HandLandmarks } from "@/hooks/useHandLandmarks";
import type { JewelleryItem } from "@/data/jewellery";

const TryOn = () => {
  const navigate = useNavigate();
  const [activePieces, setActivePieces] = useState<JewelleryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faceLandmarks, setFaceLandmarks] = useState<FaceLandmarks | null>(null);
  const [handLandmarks, setHandLandmarks] = useState<HandLandmarks[]>([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer for container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Responsive: auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectItem = useCallback((item: JewelleryItem) => {
    setActivePieces((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
    // Close sidebar on mobile after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setActivePieces((prev) => prev.filter((p) => p.id !== itemId));
  }, []);

  const handleTrackingUpdate = useCallback((data: TrackingData) => {
    setFaceLandmarks(data.face);
    setHandLandmarks(data.hands);
  }, []);

  // Capture screenshot
  const handleCapture = useCallback(() => {
    const video = containerRef.current?.querySelector("video");
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    // TODO: overlay jewellery on canvas for full capture
    const link = document.createElement("a");
    link.download = `jewel-ar-tryon-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const needsFace = activePieces.some((p) => p.category === "earrings" || p.category === "necklaces");
  const needsHand = activePieces.some((p) => p.category === "rings" || p.category === "bracelets");
  const missingFace = needsFace && !faceLandmarks;
  const missingHand = needsHand && handLandmarks.length === 0;

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border glass-dark z-30 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="font-display text-base sm:text-lg text-foreground">
          <span className="text-gold-gradient">Jewel</span> AR
        </h1>
        <div className="flex items-center gap-2">
          {/* Capture button */}
          <button
            onClick={handleCapture}
            className="glass-dark p-2 rounded-sm border border-border hover:border-gold/30 transition-colors"
            title="Capture photo"
          >
            <CameraIcon className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Camera + AR overlays */}
        <div className="flex-1 relative" ref={containerRef}>
          <CameraView onTrackingUpdate={handleTrackingUpdate}>
            {activePieces.map((item) => (
              <ARJewelleryOverlay
                key={item.id}
                item={item}
                faceLandmarks={faceLandmarks}
                handLandmarks={handLandmarks}
                containerWidth={containerSize.w}
                containerHeight={containerSize.h}
                mirrored
              />
            ))}

            {/* Guidance messages */}
            {(missingFace || missingHand) && (
              <div className="absolute inset-x-0 bottom-20 sm:bottom-16 flex justify-center z-20 px-4">
                <div className="glass-dark px-4 py-2.5 rounded-sm border border-gold/20 max-w-sm">
                  <p className="text-foreground text-xs sm:text-sm font-body text-center">
                    {missingFace && missingHand
                      ? "Show your face & hands to try on jewellery"
                      : missingFace
                      ? "Position your face in the camera for earrings & necklaces"
                      : "Show your hand to try on rings & bangles"}
                  </p>
                </div>
              </div>
            )}
          </CameraView>

          {/* Active pieces strip */}
          {activePieces.length > 0 && (
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-20">
              <div className="glass-dark rounded-sm border border-border p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
                <span className="text-[10px] sm:text-xs font-body text-muted-foreground shrink-0 px-1.5">
                  Wearing:
                </span>
                {activePieces.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 flex items-center gap-1.5 bg-secondary rounded-sm px-1.5 sm:px-2 py-1 group"
                  >
                    <img src={item.image} alt={item.name} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    <span className="text-[10px] sm:text-xs font-body text-foreground hidden sm:inline max-w-[80px] truncate">
                      {item.name}
                    </span>
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
                    className="text-[10px] sm:text-xs font-body text-gold hover:text-gold-light transition-colors shrink-0 px-1.5"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - responsive overlay on mobile, fixed on desktop */}
        {sidebarOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-background/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed lg:relative right-0 top-0 bottom-0 w-72 sm:w-80 shrink-0 z-40 lg:z-auto shadow-elegant lg:shadow-none">
              <JewellerySidebar onSelectItem={handleSelectItem} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TryOn;
