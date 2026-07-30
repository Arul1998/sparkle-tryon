import { motion } from "framer-motion";
import { Camera, Upload, Sparkles, ShoppingBag } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Live Camera",
    description: "Use your webcam to see jewellery on you in real time",
  },
  {
    icon: Upload,
    title: "Upload Pieces",
    description: "Add your own jewellery images to try on virtually",
  },
  {
    icon: Sparkles,
    title: "Perfect Fit",
    description: "Drag & resize pieces to find the perfect placement",
  },
  {
    icon: ShoppingBag,
    title: "Shop Ready",
    description: "Confident purchases after seeing how it looks on you",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-gold font-body text-sm tracking-[0.3em] uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground">
            Try Before You Buy
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center p-8 rounded-sm border border-border hover:border-gold/30 transition-colors group"
            >
              <div className="w-14 h-14 mx-auto mb-6 rounded-sm bg-secondary flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-xl mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
