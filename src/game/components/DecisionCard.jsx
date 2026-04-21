import { motion } from "framer-motion";
import ImpactPreview from "./ImpactPreview";

const TONES = {
  green: { accent: "#42d38b", glow: "rgba(66, 211, 139, 0.36)" },
  orange: { accent: "#ff9f43", glow: "rgba(255, 159, 67, 0.38)" },
  red: { accent: "#ff5c6c", glow: "rgba(255, 92, 108, 0.38)" },
  blue: { accent: "#68a7ff", glow: "rgba(104, 167, 255, 0.34)" },
};

function getToneName(option, index) {
  if (option.tone) return option.tone;
  if (option.previewAnimation === "money-flow" || option.previewAnimation === "rescue") return "green";
  if (option.previewAnimation === "rising-chart" || option.previewAnimation === "market" || option.previewAnimation === "tech") return "orange";
  if (option.previewAnimation === "falling-chart" || option.previewAnimation === "crisis") return "red";
  return index === 0 ? "green" : "orange";
}

function DecisionIllustration({ type, tone }) {
  if (type === "money-flow" || type === "rescue") {
    return <div className="psim-decision-visual"><div className="psim-anim-money" /></div>;
  }
  if (type === "rising-chart" || type === "market" || type === "tech") {
    return <div className="psim-decision-visual"><div className="psim-anim-chart-up" /></div>;
  }
  if (type === "falling-chart" || type === "crisis") {
    return <div className="psim-decision-visual"><div className="psim-anim-chart-down" /></div>;
  }
  return <div className="psim-decision-visual"><span>🎯</span></div>;
}

export default function DecisionCard({ option, index, disabled, onSelect, onHover }) {
  const toneName = getToneName(option, index);
  const tone = TONES[toneName] || TONES.blue;
  const title = option.title || option.label;
  const rationale = option.description || option.rationale;
  const animType = option.previewAnimation || (index === 0 ? "money-flow" : "rising-chart");

  return (
    <motion.button
      type="button"
      className={`psim-cinema-card psim-tone-${toneName}`}
      style={{
        "--decision-accent": tone.accent,
        "--decision-glow": tone.glow,
      }}
      disabled={disabled}
      onClick={onSelect}
      onHoverStart={() => {
        if (!disabled && onHover) onHover();
      }}
      whileHover={disabled ? undefined : { y: -6, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      title={rationale}
    >
      {/* Glow border overlay */}
      <span className="psim-cinema-card-glow" aria-hidden="true" />

      {/* Index badge */}
      <span className="psim-cinema-card-index">{index === 0 ? "A" : "B"}</span>

      {/* Content */}
      <span className="psim-cinema-card-content">
        <span className="psim-cinema-card-body">
          <span className="psim-cinema-card-title">{title}</span>
          <span className="psim-cinema-card-rationale">{rationale}</span>
        </span>
        <ImpactPreview impact={option.impact} compact />
      </span>

      {/* Animation Visual */}
      <DecisionIllustration type={animType} tone={toneName} />
    </motion.button>
  );
}
