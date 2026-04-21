import { AnimatePresence, motion } from "framer-motion";

const PARTICLES = Array.from({ length: 22 }, (_, index) => ({
  id: index,
  angle: (index / 22) * 360,
  distance: 80 + (index % 5) * 18,
  delay: (index % 4) * 0.018,
}));

const THEMES = {
  good: { className: "is-good", color: "#42d38b" },
  bad: { className: "is-bad", color: "#ff5c6c" },
  warn: { className: "is-warn", color: "#ffb545" },
};

export default function EffectOverlay({ feedback }) {
  const theme = THEMES[feedback?.tone] || THEMES.warn;

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          className={`psim-effect-overlay ${theme.className}`}
          key={feedback.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ "--effect-color": theme.color }}
        >
          <motion.div
            className="psim-effect-flash"
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.52, ease: "easeOut" }}
          />
          <div className="psim-effect-burst" aria-hidden="true">
            {PARTICLES.map((particle) => (
              <span
                key={particle.id}
                style={{
                  "--angle": `${particle.angle}deg`,
                  "--distance": `${particle.distance}px`,
                  "--delay": `${particle.delay}s`,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
