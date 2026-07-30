import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, Trash2, Camera as CameraIcon } from "lucide-react";
import { toast } from "sonner";
import CameraView, { type TrackingData } from "@/components/CameraView";
import JewellerySidebar from "@/components/JewellerySidebar";
import ARJewelleryOverlay from "@/components/ARJewelleryOverlay";
import ErrorBoundary from "@/components/ErrorBoundary";
import { captureTryOn } from "@/lib/captureTryOn";
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
  const [videoDims, setVideoDims] = useState({ w: 0, h: 0 });
  const [mirrored, setMirrored] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleItem = useCallback((item: JewelleryItem) => {
    setActivePieces((current) =>
      current.some((piece) => piece.id === item.id)
        ? current.filter((piece) => piece.id !== item.id)
        : [...current, item],
    );
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setActivePieces((current) => current.filter((piece) => piece.id !== itemId));
  }, []);

  const handleTrackingUpdate = useCallback((data: TrackingData) => {
    setFaceLandmarks(data.face);
    setHandLandmarks(data.hands);
    if (data.videoWidth > 0 && data.videoHeight > 0) {
      setVideoDims({ w: data.videoWidth, h: data.videoHeight });
    }
  }, []);

  const handleCapture = useCallback(async () => {
    const container = containerRef.current;
    const video = container?.querySelector("video");
    if (!container || !video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      toast.error("Enable the camera before taking a photo.");
      return;
    }

    try {
      const blob = await captureTryOn(container, video, mirrored);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `sparkle-tryon-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Try-on photo saved with your jewellery.");
    } catch {
      toast.error("Photo capture failed. Please try again.");
    }
  }, [mirrored]);

  const selectedIds = useMemo(
    () => new Set(activePieces.map((piece) => piece.id)),
    [activePieces],
  );
  const needsFace = activePieces.some((piece) =>
    ["earrings", "necklaces", "glasses"].includes(piece.category),
  );
  const needsHand = activePieces.some((piece) =>
    ["rings", "bracelets"].includes(piece.category),
  );
  const missingFace = needsFace && !faceLandmarks;
  const missingHand = needsHand && handLandmarks.length === 0;

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border glass-dark z-30 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          aria-label="Return to home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <h1 className="font-display text-base sm:text-lg text-foreground">
          <span className="text-gold-gradient">Sparkle</span> Try-On
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCapture}
            className="glass-dark p-2 rounded-sm border border-border hover:border-gold/30 transition-colors"
            aria-label="Capture try-on photo"
          >
            <CameraIcon className="w-4 h-4 text-gold" />
          </button>
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={sidebarOpen ? "Close jewellery collection" : "Open jewellery collection"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative" ref={containerRef}>
          <ErrorBoundary
            fallbackTitle="Camera Error"
            fallbackMessage="Failed to initialize camera or AR tracking. Please check your camera permissions and try again."
          >
            <CameraView
              mirrored={mirrored}
              onMirroredChange={setMirrored}
              onTrackingUpdate={handleTrackingUpdate}
            >
              <ErrorBoundary
                fallbackTitle="3D Rendering Error"
                fallbackMessage="WebGL encountered an issue rendering jewellery. Your browser may not fully support 3D rendering."
              >
                {activePieces.map((item) => (
                  <ARJewelleryOverlay
                    key={item.id}
                    item={item}
                    faceLandmarks={faceLandmarks}
                    handLandmarks={handLandmarks}
                    containerWidth={containerSize.w}
                    containerHeight={containerSize.h}
                    videoWidth={videoDims.w}
                    videoHeight={videoDims.h}
                    mirrored={mirrored}
                  />
                ))}
              </ErrorBoundary>

              {(missingFace || missingHand) && (
                <div className="absolute inset-x-0 bottom-20 sm:bottom-16 flex justify-center z-20 px-4">
                  <div className="glass-dark px-4 py-2.5 rounded-sm border border-gold/20 max-w-sm">
                    <p className="text-foreground text-xs sm:text-sm font-body text-center">
                      {missingFace && missingHand
                        ? "Show your face & hands to try on jewellery"
                        : missingFace
                          ? "Position your face in the camera for face jewellery"
                          : "Show your hand to try on rings & bracelets"}
                    </p>
                  </div>
                </div>
              )}
            </CameraView>
          </ErrorBoundary>

          {activePieces.length > 0 && (
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-20">
              <div className="glass-dark rounded-sm border border-border p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
                <span className="text-[10px] sm:text-xs font-body text-muted-foreground shrink-0 px-1.5">Wearing:</span>
                {activePieces.map((item) => (
                  <div key={item.id} className="shrink-0 flex items-center gap-1.5 bg-secondary rounded-sm px-1.5 sm:px-2 py-1 group">
                    <img src={item.image} alt="" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                    <span className="text-[10px] sm:text-xs font-body text-foreground hidden sm:inline max-w-[80px] truncate">{item.name}</span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Remove ${item.name}`}
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
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <>
            <button
              className="lg:hidden fixed inset-0 bg-background/50 z-30"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close jewellery collection"
            />
            <div className="fixed lg:relative right-0 top-0 bottom-0 w-72 sm:w-80 shrink-0 z-40 lg:z-auto shadow-elegant lg:shadow-none">
              <JewellerySidebar
                selectedIds={selectedIds}
                onToggleItem={handleToggleItem}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TryOn;
