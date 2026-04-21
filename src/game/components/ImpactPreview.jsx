import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

const IMPACT_META = [
  { key: "cpi", label: "CPI", suffix: "%", badWhen: (value) => value > 0.5 },
  { key: "cov", label: "An sinh", suffix: "%", badWhen: (value) => value < 0 },
  { key: "roic", label: "ROIC", suffix: "%", badWhen: (value) => value < 0 },
  { key: "bud", label: "Ngân sách", suffix: " tỷ", badWhen: (value) => value < 0 },
];

function getTone(meta, value) {
  if (value === 0) return "neutral";
  return meta.badWhen(value) ? "bad" : "good";
}

function AnimatedImpactNumber({ value, suffix }) {
  const count = useMotionValue(0);
  const decimals = Number.isInteger(value) ? 0 : 1;
  const formatted = useTransform(count, (latest) => {
    const prefix = latest > 0 ? "+" : "";
    return `${prefix}${latest.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    count.set(0);
    const controls = animate(count, value, {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [count, value]);

  return <motion.span className="psim-impact-value">{formatted}</motion.span>;
}

export default function ImpactPreview({ impact = {}, compact = false, showZero = true }) {
  const entries = IMPACT_META
    .map((meta) => ({
      ...meta,
      value: Number(impact[meta.key] || 0),
    }))
    .filter((entry) => showZero || entry.value !== 0);

  return (
    <div className={`psim-impact-preview ${compact ? "is-compact" : ""}`}>
      {entries.map((entry, index) => (
        <motion.div
          className={`psim-impact-chip is-${getTone(entry, entry.value)}`}
          key={entry.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05 }}
        >
          <span className="psim-impact-label">{entry.label}</span>
          <AnimatedImpactNumber value={entry.value} suffix={entry.suffix} />
        </motion.div>
      ))}
    </div>
  );
}
