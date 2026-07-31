import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-display text-xl text-gold-gradient mb-2">Sparkle</p>
          <p className="text-muted-foreground text-xs font-body tracking-wider">
            Virtual Try-On Experience
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
