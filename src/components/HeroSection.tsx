import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Luxury jewellery"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-6"
        >
          Virtual Try-On Experience
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-tight mb-8"
        >
          <span className="text-foreground">See It On </span>
          <span className="text-gold-gradient italic">You</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-muted-foreground font-body text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Try on exquisite jewellery pieces in real time using augmented reality. 
          Earrings, necklaces, rings — experience them before you commit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/try-on")}
            className="bg-gold-gradient text-primary-foreground font-body font-medium px-10 py-4 rounded-sm text-sm tracking-wider uppercase hover:opacity-90 transition-opacity shadow-gold"
          >
            Start Try-On
          </button>
          <button
            onClick={() => navigate("/try-on")}
            className="border border-gold/30 text-gold font-body font-medium px-10 py-4 rounded-sm text-sm tracking-wider uppercase hover:bg-gold/10 transition-colors"
          >
            Browse Collection
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
