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
  if (option.previewAnimation === "rising-chart" || option.previewAnimation === "market") return "orange";
  if (option.previewAnimation === "falling-chart") return "red";
  return index === 0 ? "green" : "orange";
}

function DecisionIllustration({ type }) {
  if (type === "rising-chart" || type === "market") {
    return (
      <div className="psim-preview psim-preview-chart" aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
    );
  }

  if (type === "air-bridge" || type === "aviation") {
    return (
      <div className="psim-preview psim-preview-runway" aria-hidden="true">
        <i className="psim-plane-shape" />
        <span />
        <span />
      </div>
    );
  }

  if (type === "network") {
    return (
      <div className="psim-preview psim-preview-network" aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
    );
  }

  if (type === "falling-chart") {
    return (
      <div className="psim-preview psim-preview-drop" aria-hidden="true">
        <span />
        <span />
        <span />
        <i />
      </div>
    );
  }

  return (
    <div className="psim-preview psim-preview-money" aria-hidden="true">
      <span />
      <span />
      <span />
      <i />
    </div>
  );
}

export default function DecisionCard({ option, index, disabled, onSelect, onHover }) {
  const toneName = getToneName(option, index);
  const tone = TONES[toneName] || TONES.blue;
  const previewType = option.previewAnimation || (index === 0 ? "money-flow" : "rising-chart");
  const title = option.title || option.label;
  const description = option.description || option.rationale;

  return (
    <motion.button
      type="button"
      className={`psim-decision-card psim-tone-${toneName}`}
      style={{
        "--decision-accent": tone.accent,
        "--decision-glow": tone.glow,
      }}
      disabled={disabled}
      onClick={onSelect}
      onHoverStart={() => {
        if (!disabled && onHover) onHover();
      }}
      whileHover={disabled ? undefined : { scale: 1.05, y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="psim-decision-index">{index === 0 ? "A" : "B"}</span>
      <DecisionIllustration type={previewType} />
      <span className="psim-decision-copy">
        <span className="psim-decision-title">{title}</span>
        <span className="psim-decision-description">{description}</span>
      </span>
      <ImpactPreview impact={option.impact} compact />
    </motion.button>
  );
}
