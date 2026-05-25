import { motion } from "framer-motion";

const LOGOS = [
  { src: "https://i.ibb.co/XfV3jbYw/google-logo-brandlogos-net-ixyfi-300x96.png", name: "Google" },
  { src: "https://i.ibb.co/Y7BBTKbL/angular-logo-brandlogos-net-beb6k-300x74.png", name: "Angular" },
  { src: "https://i.ibb.co/LzjKzK3V/walmart-2008-2025-logo-512x128.png", name: "Walmart" },
  { src: "https://i.ibb.co/nMbkbspS/ibm-logo-brandlogo.png", name: "IBM" },
  { src: "https://i.ibb.co/0pPkzhSy/Samsung-Group-logo-300x46.png", name: "Samsung" },
  { src: "https://i.ibb.co/Fbjty7ms/safarico.gif", name: "Safaricom" },
  { src: "https://i.ibb.co/b5ky1wjg/t-microsoft.webp", name: "Microsoft" },
  { src: "https://i.ibb.co/xKgYVPQz/facebook-meta1731.webp", name: "Meta" },
  { src: "https://i.ibb.co/NnFhVzjk/hubspot8920.jpg", name: "HubSpot" },
  { src: "https://i.ibb.co/Pz3Ywc1Q/anthropic-ai4629-logowik.webp", name: "Anthropic" },
];

export default function BrandsMarquee() {
  // Duplicate the row so the translate -50% loop appears seamless.
  const row = [...LOGOS, ...LOGOS];

  return (
    <section className="py-16 lg:py-20 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-[-0.02em] leading-[1.2]"
        >
          Teams from top companies
          <br />
          manage their events with{" "}
          <span className="text-primary">Hostquill</span>
        </motion.h2>
      </div>

      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex items-center gap-10 sm:gap-14 w-max animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {row.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="shrink-0 w-[140px] sm:w-[160px] h-16 sm:h-20 flex items-center justify-center"
              title={logo.name}
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="max-h-full max-w-full w-auto h-auto object-contain opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition-all"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
