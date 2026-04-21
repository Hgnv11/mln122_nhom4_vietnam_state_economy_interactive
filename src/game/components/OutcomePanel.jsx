import { AnimatePresence, motion } from "framer-motion";

const METRICS = [
  { key: "cpi", label: "CPI", suffix: "%", goodWhen: (delta) => delta < 0 },
  { key: "cov", label: "An sinh", suffix: "%", goodWhen: (delta) => delta > 0 },
  { key: "roic", label: "ROIC", suffix: "%", goodWhen: (delta) => delta > 0 },
  { key: "bud", label: "Ngân sách", suffix: " tỷ", goodWhen: (delta) => delta > 0 },
];

function formatValue(value, suffix) {
  const decimals = Number.isInteger(value) ? 0 : 1;
  return `${Number(value).toFixed(decimals)}${suffix}`;
}

function getDelta(before, after) {
  const delta = Number((after - before).toFixed(1));
  return `${delta > 0 ? "+" : ""}${delta}`;
}

export default function OutcomePanel({ outcome }) {
  return (
    <AnimatePresence>
      {outcome && (
        <motion.aside
          className={`psim-outcome-panel is-${outcome.tone || "neutral"}`}
          key={outcome.id}
          initial={{ opacity: 0, x: "-50%", y: 28, scale: 0.98 }}
          animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
          exit={{ opacity: 0, x: "-50%", y: 20, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="psim-outcome-head">
            <span>{outcome.kind || "Báo cáo tác động"}</span>
            <strong>{outcome.title}</strong>
          </div>
          <div className="psim-outcome-grid">
            {METRICS.map((metric) => {
              const before = outcome.before?.[metric.key] ?? 0;
              const after = outcome.after?.[metric.key] ?? before;
              const delta = after - before;
              const tone = delta === 0 ? "neutral" : metric.goodWhen(delta) ? "good" : "bad";

              return (
                <div className={`psim-outcome-metric is-${tone}`} key={metric.key}>
                  <span>{metric.label}</span>
                  <b>{formatValue(after, metric.suffix)}</b>
                  <i>{getDelta(before, after)}</i>
                </div>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
