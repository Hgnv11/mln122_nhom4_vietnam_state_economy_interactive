import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SCENE_BY_ENTITY = {
  EVN: { background: "energy.webp", type: "power", label: "Lưới điện quốc gia", accent: "#f2c14e" },
  PVN: { background: "oil.webp", type: "oil", label: "Giàn khoan dầu khí", accent: "#7dd3fc" },
  VNPT: { background: "telecom.webp", type: "telecom", label: "Hạ tầng viễn thông", accent: "#86efac" },
  NHNN: { background: "finance.webp", type: "economic", label: "Trung tâm tài chính", accent: "#f4a7aa" },
  TKV: { background: "coal.webp", type: "coal", label: "Chuỗi cung ứng than", accent: "#f2c14e" },
  VNA: { background: "aviation.webp", type: "aviation", label: "Mạng bay quốc gia", accent: "#7dd3fc" },
};

const TYPE_DEFAULTS = {
  storm: { background: "storm.webp", label: "Ứng phó thiên tai", accent: "#93c5fd" },
  economic: { background: "finance.webp", label: "Thị trường tài chính", accent: "#ff5c6c" },
  aviation: { background: "aviation.webp", label: "Hành lang hàng không", accent: "#7dd3fc" },
  power: { background: "energy.webp", label: "Lưới điện quốc gia", accent: "#f2c14e" },
  oil: { background: "oil.webp", label: "Dầu khí ngoài khơi", accent: "#7dd3fc" },
  coal: { background: "coal.webp", label: "Mỏ than và nhiên liệu", accent: "#f2c14e" },
  telecom: { background: "telecom.webp", label: "Mạng viễn thông", accent: "#86efac" },
  shipping: { background: "shipping.webp", label: "Vận tải biển", accent: "#60a5fa" },
  tech: { background: "telecom.webp", label: "Đột phá công nghệ", accent: "#86efac" },
};

const FALLBACK_GRADIENTS = {
  storm:
    "radial-gradient(circle at 30% 10%, rgba(147,197,253,0.28), transparent 34%), linear-gradient(135deg, #07111f 0%, #121827 56%, #05070d 100%)",
  economic:
    "radial-gradient(circle at 12% 22%, rgba(255,92,108,0.24), transparent 32%), linear-gradient(135deg, #180609 0%, #250d17 48%, #07070b 100%)",
  aviation:
    "radial-gradient(circle at 80% 8%, rgba(125,211,252,0.26), transparent 34%), linear-gradient(145deg, #061624 0%, #10233a 54%, #040914 100%)",
  power:
    "radial-gradient(circle at 78% 18%, rgba(242,193,78,0.24), transparent 34%), linear-gradient(135deg, #06170f 0%, #10231f 50%, #030912 100%)",
  oil:
    "radial-gradient(circle at 70% 18%, rgba(125,211,252,0.2), transparent 36%), linear-gradient(135deg, #071827 0%, #10283b 52%, #030912 100%)",
  coal:
    "radial-gradient(circle at 22% 16%, rgba(242,193,78,0.18), transparent 35%), linear-gradient(135deg, #16110b 0%, #241c14 48%, #070604 100%)",
  telecom:
    "radial-gradient(circle at 70% 10%, rgba(134,239,172,0.2), transparent 36%), linear-gradient(135deg, #03151b 0%, #072820 56%, #02080c 100%)",
  shipping:
    "radial-gradient(circle at 74% 8%, rgba(96,165,250,0.22), transparent 36%), linear-gradient(135deg, #061629 0%, #0b233f 54%, #030814 100%)",
  tech:
    "radial-gradient(circle at 50% 12%, rgba(134,239,172,0.24), transparent 34%), linear-gradient(135deg, #04151c 0%, #0b2b27 54%, #02080c 100%)",
};

const RAIN_DROPS = Array.from({ length: 58 }, (_, index) => ({
  id: index,
  left: (index * 17) % 101,
  delay: ((index * 11) % 37) / 10,
  duration: 0.72 + ((index * 7) % 18) / 100,
  opacity: 0.34 + ((index * 5) % 42) / 100,
}));

const SPARKS = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: 8 + ((index * 19) % 86),
  top: 10 + ((index * 13) % 74),
  delay: ((index * 9) % 28) / 10,
}));

function normalizeScene(event) {
  const entityScene = SCENE_BY_ENTITY[event?.entity] || {};
  const type = event?.type || entityScene.type || "economic";
  const typeScene = TYPE_DEFAULTS[type] || TYPE_DEFAULTS.economic;

  return {
    title: event?.title || "Tín hiệu chính sách",
    description: event?.description || event?.desc || "",
    entity: event?.entity || event?.sceneLabel || "HỆ THỐNG",
    type,
    intensity: event?.intensity || entityScene.intensity || "medium",
    background: event?.background || entityScene.background || typeScene.background,
    label: event?.sceneLabel || entityScene.label || typeScene.label,
    accent: event?.entityColor || entityScene.accent || typeScene.accent,
  };
}

function StormLayer() {
  return (
    <>
      <div className="psim-storm-dark" />
      <div className="psim-rain-layer" aria-hidden="true">
        {RAIN_DROPS.map((drop) => (
          <span
            key={drop.id}
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>
      <div className="psim-lightning" aria-hidden="true" />
    </>
  );
}

function EconomicLayer() {
  return (
    <>
      <div className="psim-economic-pulse" aria-hidden="true" />
      <div className="psim-glitch-grid" aria-hidden="true" />
      <div className="psim-falling-chart" aria-hidden="true">
        <svg viewBox="0 0 260 130" role="presentation">
          <polyline points="0,24 40,34 78,42 112,66 148,62 184,92 222,101 260,118" />
        </svg>
      </div>
    </>
  );
}

function AviationLayer() {
  return (
    <>
      <div className="psim-warning-lights" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="psim-aviation-hud" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="psim-plane-field" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </>
  );
}

function EnergyLayer() {
  return (
    <>
      <div className="psim-energy-grid" aria-hidden="true" />
      <div className="psim-sparks" aria-hidden="true">
        {SPARKS.map((spark) => (
          <span
            key={spark.id}
            style={{
              left: `${spark.left}%`,
              top: `${spark.top}%`,
              animationDelay: `${spark.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function OilLayer() {
  return (
    <>
      <div className="psim-oil-sea" aria-hidden="true" />
      <div className="psim-oil-ticker" aria-hidden="true">
        <span>BRENT</span>
        <i />
        <b>-38%</b>
      </div>
      <div className="psim-oil-bubbles" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((dot) => (
          <span key={dot} />
        ))}
      </div>
    </>
  );
}

function CoalLayer() {
  return (
    <>
      <div className="psim-coal-dust" aria-hidden="true" />
      <div className="psim-coal-conveyor" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </>
  );
}

function TelecomLayer() {
  return (
    <>
      <div className="psim-telecom-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="psim-telecom-nodes" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </>
  );
}

function ShippingLayer() {
  return (
    <>
      <div className="psim-shipping-routes" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="psim-ship-alert" aria-hidden="true">!</div>
    </>
  );
}

function SceneEffect({ type }) {
  if (type === "storm") return <StormLayer />;
  if (type === "economic") return <EconomicLayer />;
  if (type === "aviation") return <AviationLayer />;
  if (type === "oil") return <OilLayer />;
  if (type === "coal") return <CoalLayer />;
  if (type === "telecom" || type === "tech") return <TelecomLayer />;
  if (type === "shipping") return <ShippingLayer />;
  return <EnergyLayer />;
}

function SignalMiniGame() {
  const [charge, setCharge] = useState(0);
  const complete = charge >= 3;

  return (
    <div className={`psim-mini-signal ${complete ? "is-complete" : ""}`}>
      <button
        type="button"
        aria-label="Ổn định tín hiệu"
        title="Nhấn để khóa tín hiệu - Tương tác tùy chọn để ổn định kết nối"
        onClick={() => setCharge((value) => Math.min(3, value + 1))}
      >
        <span className="psim-mini-core" />
      </button>
      <div className="psim-mini-dots" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className={charge > dot ? "is-lit" : ""} />
        ))}
      </div>
      <span className="psim-mini-label">{complete ? "TÍN HIỆU ỔN ĐỊNH" : "KHÓA TÍN HIỆU"}</span>
    </div>
  );
}

export default function EventScene({ event, quarter, transitioning = false }) {
  const scene = useMemo(() => normalizeScene(event), [event]);
  const [imageReady, setImageReady] = useState(true);
  const source = scene.background?.startsWith("/")
    ? scene.background
    : `/assets/events/${scene.background}`;

  useEffect(() => {
    setImageReady(true);
  }, [source]);

  const backgroundImage = imageReady
    ? `linear-gradient(180deg, rgba(2, 8, 18, 0.12), rgba(2, 8, 18, 0.78)), url("${source}")`
    : FALLBACK_GRADIENTS[scene.type] || FALLBACK_GRADIENTS.economic;

  return (
    <AnimatePresence mode="wait">
      <motion.figure
        className={`psim-event-scene psim-event-scene--${scene.type} psim-intensity-${scene.intensity} ${transitioning ? "is-transitioning" : ""}`}
        key={`${scene.title}-${scene.background}-${scene.type}`}
        style={{
          backgroundImage,
          "--scene-accent": scene.accent,
        }}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <img
          className="psim-scene-preload"
          src={source}
          alt=""
          onError={() => setImageReady(false)}
          onLoad={() => setImageReady(true)}
        />
        <SceneEffect type={scene.type} />
        <figcaption className="psim-scene-caption">
          <span className="psim-scene-kicker">{scene.label}</span>
          <h2>{scene.title}</h2>
          <p>{scene.description}</p>
        </figcaption>
        <div className="psim-scene-readout" aria-hidden="true">
          <span>{scene.entity}</span>
          <span>Quý {quarter}/12</span>
        </div>
        <SignalMiniGame />
      </motion.figure>
    </AnimatePresence>
  );
}
