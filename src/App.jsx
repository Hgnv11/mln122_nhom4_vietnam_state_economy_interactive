import { useEffect, useMemo, useRef, useState } from "react";
import DecisionCard from "./game/components/DecisionCard";
import EffectOverlay from "./game/components/EffectOverlay";
import EventScene from "./game/components/EventScene";
import ImpactPreview from "./game/components/ImpactPreview";
import OutcomePanel from "./game/components/OutcomePanel";
import QuarterTimeline from "./game/components/QuarterTimeline";
import "./game/game.css";

// ═══════════════════════════════════════════════════════════════════════════
// HỆ THỐNG ÂM THANH (Synth Web Audio API)
// ═══════════════════════════════════════════════════════════════════════════
let audioCtx;
const initAudio = () => {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const playTone = (freq, type, duration, vol = 0.1) => {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) { }
};

let bgmNode = null;
export const SFX = {
  hover: () => playTone(300, 'sine', 0.05, 0.01),
  click: () => playTone(600, 'sine', 0.1, 0.03),
  confirm: () => { playTone(300, 'square', 0.1, 0.03); setTimeout(() => playTone(450, 'square', 0.2, 0.03), 100); },
  alert: () => { playTone(400, 'sawtooth', 0.3, 0.05); setTimeout(() => playTone(800, 'sawtooth', 0.3, 0.05), 300); setTimeout(() => playTone(400, 'sawtooth', 0.3, 0.05), 600); },
  win: () => { playTone(440, 'sine', 0.1, 0.05); setTimeout(() => playTone(554, 'sine', 0.1, 0.05), 150); setTimeout(() => playTone(659, 'sine', 0.4, 0.05), 300); },
  lose: () => playTone(150, 'sawtooth', 0.8, 0.1),
  law: () => { playTone(523, 'triangle', 0.2, 0.05); setTimeout(() => playTone(659, 'triangle', 0.4, 0.05), 150); },
  bgm: (play) => {
    if (!audioCtx) return;
    if (play && !bgmNode) {
      try {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const lfoGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc1.type = 'triangle'; osc1.frequency.value = 55;
        osc2.type = 'sine'; osc2.frequency.value = 55.5;
        filter.type = 'lowpass'; filter.frequency.value = 150; filter.Q.value = 0;
        lfo.type = 'sine'; lfo.frequency.value = 0.08;
        lfo.connect(lfoGain); lfoGain.gain.value = 80; lfoGain.connect(filter.frequency);
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 3);

        osc1.connect(filter); osc2.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
        osc1.start(); osc2.start(); lfo.start();
        bgmNode = { osc1, osc2, lfo, gain, filter };
      } catch (e) { }
    } else if (!play && bgmNode) {
      try {
        bgmNode.gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 2);
        const n = bgmNode;
        bgmNode = null;
        setTimeout(() => { try { n.osc1.stop(); n.osc2.stop(); n.lfo.stop(); n.gain.disconnect(); n.filter.disconnect(); } catch (e) { } }, 2100);
      } catch (e) { }
    }
  }
};

const NAV_ITEMS = [
  { id: "hero", label: "Mở đầu" },
  { id: "lyluan", label: "Lý luận" },
  { id: "thuctrang", label: "Thực trạng" },
  { id: "phantich", label: "Phân tích" },
  { id: "giaiphap", label: "Giải pháp" },
  { id: "game", label: "Mini-game" },
  { id: "quiz", label: "Tranh luận" },
  { id: "nghiencuu", label: "Nghiên cứu" },
  { id: "ketluan", label: "Kết luận" }
];

const MARQUEE_TOKENS = [
  "Cạnh tranh",
  "Độc quyền",
  "Độc quyền tự nhiên",
  "Độc quyền nhà nước",
  "Giá cả độc quyền",
  "Lợi nhuận độc quyền",
  "Tích tụ tư bản",
  "Tập trung sản xuất",
  "Điều tiết vĩ mô",
  "Hàng hóa công cộng",
  "V.I.Lênin — 5 đặc điểm",
  "Kinh tế thị trường định hướng XHCN"
];

const HERO_STATS = [
  { value: "47.2%", label: "Tỉ trọng năng lượng sơ cấp từ dầu khí và điện lưới quốc gia" },
  { value: "≈ 97", label: "Tập đoàn và tổng công ty nhà nước đang hoạt động" },
  { value: "500 kV", label: "Trục truyền tải Bắc — Nam do Nhà nước nắm độc quyền tự nhiên" }
];

const THEORY_ITEMS = [
  {
    id: "von-lon",
    index: "01",
    cardTitle: "Vốn lớn & chu kỳ dài",
    cardSummary:
      "Các ngành điện, dầu khí, truyền tải đòi hỏi vốn đầu tư rất lớn và sức chịu rủi ro ở tầm quốc gia.",
    detailTitle: "Vốn lớn và chu kỳ đầu tư dài hạn",
    detailText:
      "Theo Lênin, khi lực lượng sản xuất phát triển tới ngưỡng nhất định, tích tụ và tập trung tư bản tất yếu dẫn tới độc quyền. Ở Việt Nam, các dự án nguồn điện, truyền tải 500 kV hay thăm dò khai thác ngoài khơi có chi phí cố định ban đầu rất cao, thời gian thu hồi vốn kéo dài hàng chục năm và cần bảo lãnh tín dụng quy mô quốc gia.",
    example:
      "Ví dụ Việt Nam: Dự án đường dây 500 kV mạch 3 Quảng Trạch — Phố Nối đi qua 9 tỉnh, vượt năng lực tài chính và điều phối của đa số doanh nghiệp tư nhân đơn lẻ.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1400&q=80",
    alt: "Hạ tầng công nghiệp quy mô lớn"
  },
  {
    id: "ha-tang",
    index: "02",
    cardTitle: "Hạ tầng xương sống",
    cardSummary:
      "Hạ tầng thiết yếu cần tính liên thông, chuẩn kỹ thuật đồng bộ, phục vụ cả vùng khó khăn.",
    detailTitle: "Hạ tầng quốc gia cần tính liên thông",
    detailText:
      "Độc quyền tự nhiên xuất hiện khi một doanh nghiệp duy nhất cung ứng hàng hóa/dịch vụ với chi phí trung bình thấp nhất, do hiệu ứng quy mô và tính không thể nhân bản của hạ tầng. Ở Việt Nam, lưới điện truyền tải, cáp quang trục quốc gia, hay ống dẫn khí là dạng hạ tầng không thể xây song song nhiều lần.",
    example:
      "Ví dụ Việt Nam: Chương trình điện khí hóa nông thôn đã đưa điện tới hơn 99% hộ dân — điều mà thị trường thuần túy khó tự giải quyết vì biên lợi nhuận ở vùng sâu rất thấp.",
    image:
      "https://images.unsplash.com/photo-1518183214770-9cffbec72538?auto=format&fit=crop&w=1400&q=80",
    alt: "Phát triển hạ tầng quốc gia"
  },
  {
    id: "dieu-tiet",
    index: "03",
    cardTitle: "Điều tiết vĩ mô",
    cardSummary:
      "Nhà nước cần công cụ bình ổn giá, giảm cú sốc chi phí lên đời sống khi thị trường biến động.",
    detailTitle: "Độc quyền nhà nước như công cụ điều tiết",
    detailText:
      "Lênin chỉ rõ: chủ nghĩa tư bản độc quyền nhà nước là sự kết hợp giữa sức mạnh của tổ chức độc quyền với sức mạnh của nhà nước. Ở Việt Nam, tập đoàn nhà nước không chỉ là chủ thể kinh tế, mà còn là công cụ thực hiện chính sách an sinh và ổn định vĩ mô.",
    example:
      "Ví dụ Việt Nam: Điều hành giá điện, xăng dầu theo lộ trình giúp hạn chế lan truyền cú sốc giá nhiên liệu thế giới vào chỉ số CPI, dù đánh đổi là tín hiệu thị trường bị làm mờ.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    alt: "Không gian hoạch định chính sách"
  }
];

const GROUP_ITEMS = [
  {
    id: "evn",
    sector: "Năng lượng",
    name: "EVN",
    fullName: "Tập đoàn Điện lực Việt Nam",
    summary:
      "Trụ cột truyền tải, điều độ và bảo đảm cung ứng điện cho toàn hệ thống.",
    role:
      "EVN nắm khâu truyền tải cao thế, điều độ hệ thống quốc gia (A0) và phân phối điện tại hầu hết địa phương, bên cạnh phần phát điện chia sẻ với nhiều nhà máy tư nhân, BOT.",
    monopoly:
      "Lưới truyền tải 500 kV và 220 kV là độc quyền tự nhiên điển hình: chi phí đầu tư lớn, không thể nhân bản song song, cần điều phối tập trung để tránh nghẽn mạch và sự cố lan rộng.",
    twoSide:
      "Mặt tích cực: đảm bảo cung ứng điện, triển khai điện khí hóa nông thôn, trợ giá bậc thang cho hộ nghèo. Mặt rủi ro: thiếu cạnh tranh ở bán lẻ, giá điện khó phản ánh đúng chi phí nhiên liệu đầu vào.",
    example:
      "Tình huống thiếu điện cục bộ miền Bắc mùa hè 2023 cho thấy sức ép nâng cấp truyền tải và tách bạch rõ hơn chức năng điều độ — phát — phân phối.",
    image:
      "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=1300&q=80",
    alt: "Lưới điện cao thế và trạm biến áp"
  },
  {
    id: "pvn",
    sector: "Dầu khí",
    name: "PVN",
    fullName: "Tập đoàn Dầu khí Việt Nam",
    summary:
      "Tích hợp thượng nguồn — hạ nguồn, đóng góp lớn cho an ninh năng lượng và ngân sách.",
    role:
      "PVN hoạt động xuyên suốt từ thăm dò, khai thác, vận chuyển khí, chế biến tới phân phối sản phẩm. Nhiều năm liên tục đóng góp 9–11% thu ngân sách nhà nước.",
    monopoly:
      "Khai thác tài nguyên quốc gia, hoạt động ngoài khơi gắn với chủ quyền biển đảo, công nghệ và quản trị rủi ro phức tạp khiến vai trò nhà nước rất khó thay thế hoàn toàn.",
    twoSide:
      "Mặt tích cực: chuỗi khí — điện — đạm tạo liên kết công nghiệp và việc làm. Mặt rủi ro: biến động giá dầu thế giới và mô hình quản trị đa ngành từng phát sinh dự án kém hiệu quả trong quá khứ.",
    example:
      "Cụm dự án Nhơn Trạch 3 & 4 dùng khí LNG là bài kiểm tra về năng lực chuyển dịch năng lượng của PVN theo cam kết Net Zero 2050.",
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1300&q=80",
    alt: "Giàn khoan ngoài khơi và công nghiệp lọc hóa dầu"
  },
  {
    id: "vnpt",
    sector: "Viễn thông & số",
    name: "VNPT / Viettel",
    fullName: "Hạ tầng viễn thông quốc gia",
    summary:
      "Hạ tầng số phủ rộng, hỗ trợ dịch vụ công, chuyển đổi số và kết nối vùng sâu, vùng xa.",
    role:
      "VNPT và Viettel cùng cung cấp mạng băng rộng, di động và nền tảng số công. Khác với điện hay dầu khí, viễn thông ở Việt Nam có cạnh tranh tương đối rõ ở bán lẻ.",
    monopoly:
      "Một số lớp hạ tầng lõi (truyền dẫn trục, trung tâm dữ liệu cấp quốc gia, hệ thống cáp quang biển) vẫn mang tính độc quyền tự nhiên do hiệu ứng mạng và chi phí cố định lớn.",
    twoSide:
      "Mặt tích cực: phổ cập băng rộng, hỗ trợ chính quyền số, y tế và giáo dục từ xa. Mặt rủi ro: nếu thiếu điều tiết dữ liệu và cạnh tranh, có thể xuất hiện độc quyền dữ liệu và bất đối xứng thông tin người dùng.",
    example:
      "Việc sớm triển khai 5G và hạ tầng đám mây nội địa là phép thử cho năng lực chuyển từ nhà mạng sang nền tảng công nghệ số.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1300&q=80",
    alt: "Hạ tầng viễn thông, cáp quang và mạng số"
  }
];

const SOLUTION_ITEMS = [
  {
    id: "co-phan-hoa",
    title: "Cổ phần hóa có chọn lọc",
    explanation:
      "Thu hút thêm vốn xã hội ở khâu có thể cạnh tranh (phát điện, bán lẻ, dịch vụ số), trong khi Nhà nước vẫn giữ cổ phần chi phối ở mắt xích chiến lược (truyền tải, điều độ, cáp trục).",
    benefit: "Kỳ vọng: kỷ luật tài chính, minh bạch, áp lực hiệu quả.",
    implication:
      "Hàm ý: xác định danh mục lĩnh vực Nhà nước chi phối tuyệt đối với lĩnh vực mở rộng sở hữu hỗn hợp trong Luật Quản lý, sử dụng vốn nhà nước sửa đổi."
  },
  {
    id: "tach-quan-ly",
    title: "Tách chức năng quản lý — chủ sở hữu — điều tiết",
    explanation:
      "Cơ quan ban hành chính sách, cơ quan giám sát cạnh tranh và cơ quan đại diện vốn (Ủy ban Quản lý vốn) cần tách biệt rõ ràng để giảm xung đột lợi ích — vừa đá bóng vừa thổi còi.",
    benefit: "Kỳ vọng: nâng chất lượng điều tiết và trách nhiệm giải trình.",
    implication:
      "Hàm ý: công bố thông tin theo chuẩn công ty niêm yết, KPI hiệu quả vốn nhà nước, kiểm toán và đánh giá độc lập."
  },
  {
    id: "thi-truong-hoa",
    title: "Thị trường hóa có kiểm soát",
    explanation:
      "Mở thị trường bán buôn và bán lẻ điện cạnh tranh, mở dịch vụ số; giữ điều tiết chặt ở hạ tầng độc quyền tự nhiên bằng cơ chế giá trần và cam kết chất lượng dịch vụ (SLA).",
    benefit: "Kỳ vọng: giảm chi phí dài hạn, khuyến khích đổi mới công nghệ.",
    implication:
      "Hàm ý: lộ trình giá theo thị trường đi kèm gói hỗ trợ nhóm dễ tổn thương, tránh sốc giá lên hộ thu nhập thấp."
  }
];

const SCENARIOS = [
  {
    id: "scenario-1",
    title: "Tình huống 1 — Bình ổn giá điện khi lạm phát",
    description:
      "Giá nhiên liệu thế giới tăng nhanh, thu nhập hộ gia đình phục hồi chậm. EVN nên được yêu cầu làm gì?",
    options: [
      { key: "a", label: "A. Giữ giá thấp đồng loạt cho mọi nhóm khách hàng", result: "mixed" },
      { key: "b", label: "B. Điều chỉnh có lộ trình + trợ cấp trực tiếp hộ yếu thế", result: "good" }
    ]
  },
  {
    id: "scenario-2",
    title: "Tình huống 2 — Mở cạnh tranh trong ngành điện",
    description:
      "Nhu cầu điện tăng mạnh theo công nghiệp hóa. Có nên mở rộng khu vực tư nhân ở khâu phát điện không?",
    options: [
      { key: "a", label: "A. Có — nhưng giữ điều độ và truyền tải dưới kiểm soát nhà nước", result: "good" },
      { key: "b", label: "B. Không — duy trì mô hình tích hợp tập trung như hiện tại", result: "mixed" }
    ]
  },
  {
    id: "scenario-3",
    title: "Tình huống 3 — Cấu trúc sở hữu doanh nghiệp hạ tầng số",
    description:
      "Trong giai đoạn chuyển đổi số sâu, cấu trúc sở hữu nào cân bằng giữa kiểm soát chiến lược và hiệu quả quản trị?",
    options: [
      { key: "a", label: "A. Giữ 100% vốn nhà nước ở hầu hết các khâu", result: "mixed" },
      { key: "b", label: "B. Nhà nước chi phối lõi độc quyền, mở sở hữu hỗn hợp ở khâu cạnh tranh", result: "good" }
    ]
  }
];

const QUIZ_FEEDBACK = {
  good:
    "Lựa chọn theo hướng cân bằng: tín hiệu thị trường vẫn hoạt động nhưng nhóm dễ tổn thương được bảo vệ và ổn định vĩ mô được giữ.",
  mixed:
    "Có thể đạt mục tiêu ngắn hạn, nhưng rủi ro dài hạn là méo mó tín hiệu giá hoặc làm giảm động lực nâng cao hiệu quả."
};

const RESEARCH_LINKS = [
  {
    label: "Giáo trình",
    title: "Giáo trình Kinh tế Chính trị Mác — Lênin (Bộ GD&ĐT)",
    description:
      "Chương 4: Cạnh tranh và độc quyền trong nền kinh tế thị trường — tài liệu học chính thức của môn MLN122.",
    href: "https://moet.gov.vn/",
    source: "moet.gov.vn"
  },
  {
    label: "Chính sách",
    title: "Nghị quyết 12-NQ/TW về cải cách DNNN",
    description:
      "Định hướng tiếp tục cơ cấu lại, đổi mới và nâng cao hiệu quả doanh nghiệp nhà nước đến 2030.",
    href: "https://tulieuvankien.dangcongsan.vn/",
    source: "tulieuvankien.dangcongsan.vn"
  },
  {
    label: "Dữ liệu",
    title: "Báo cáo thường niên — EVN",
    description:
      "Số liệu sản lượng điện, tỉ lệ điện khí hóa, cơ cấu nguồn phát và đầu tư hạ tầng truyền tải.",
    href: "https://www.evn.com.vn/",
    source: "evn.com.vn"
  },
  {
    label: "Dữ liệu",
    title: "Tập đoàn Dầu khí Việt Nam — PVN",
    description:
      "Thông tin vận hành, các dự án chiến lược thượng nguồn, hạ nguồn và đóng góp ngân sách.",
    href: "https://www.pvn.vn/",
    source: "pvn.vn"
  },
  {
    label: "Nghiên cứu",
    title: "World Bank — Vietnam Development Report",
    description:
      "Phân tích vai trò của khu vực nhà nước trong tăng trưởng, năng lực cạnh tranh và cải cách thể chế.",
    href: "https://www.worldbank.org/en/country/vietnam",
    source: "worldbank.org"
  },
  {
    label: "Học thuật",
    title: "Tạp chí Cộng sản — Chuyên đề DNNN",
    description:
      "Các bài bình luận, phân tích cập nhật về vai trò chủ đạo của kinh tế nhà nước tại Việt Nam.",
    href: "https://www.tapchicongsan.org.vn/",
    source: "tapchicongsan.org.vn"
  }
];

function useRoute() {
  const getRoute = () =>
    typeof window !== "undefined" && window.location.hash === "#/game" ? "game" : "home";
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const BLACK_SWAN_SPAWN_RATE = 0.20;
const POLICY_PPP_ROIC_BUFF = 1.5;
const POLICY_STABILIZE_CPI_REDUCTION = 0.4;
const POLICY_STABILIZE_ROIC_PENALTY = 0.4;
const POLICY_TAX_BUDGET_BOOST = 40;
const POLICY_TAX_WELFARE_PENALTY = 3;
const SAVE_KEY = 'policySimSave';

// Shuffle array utility
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Local storage utilities
const loadGame = (setGameState, setQuarter, setStats, setHistory, setLogs, setEventIndex, setActivePolicies) => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setGameState(data.gameState || "start");
      setQuarter(data.quarter || 1);
      setStats(data.stats || INIT_STATS);
      setHistory(data.history || [INIT_STATS]);
      setLogs(data.logs || INIT_LOGS);
      setEventIndex(data.eventIndex || 0);
      setActivePolicies(data.activePolicies || []);
    }
  } catch (e) {}
};

const saveGame = (gameState, quarter, stats, history, logs, eventIndex, activePolicies) => {
  const data = {
    gameState,
    quarter,
    stats,
    history,
    logs,
    eventIndex,
    activePolicies,
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
};

// ═══════════════════════════════════════════════════════════════════════════
// DỮ LIỆU SỰ KIỆN CHÍNH
// ═══════════════════════════════════════════════════════════════════════════
const GAME_EVENTS = [
  {
    id: 1, entity: "EVN", entityColor: "#f2c14e", entityBg: "rgba(242,193,78,0.15)",
    title: "Khủng hoảng thiếu điện mùa khô",
    description: "Hồ thủy điện cạn nhanh, lưới truyền tải rung lên trong giờ cao điểm và giá than đội chi phí từng phút.",
    desc: "Mực nước hồ thủy điện cảnh báo. Giá than tăng 40%. Biên lợi nhuận EVN thủng đáy. Giải pháp của cấp điều hành là gì?",
    background: "energy.webp",
    type: "power",
    intensity: "high",
    sceneLabel: "Lưới điện quốc gia",
    options: [
      { label: "Giữ giá điện — chịu lỗ, lấy ngân sách bình ổn", description: "Khóa biểu giá, bơm quỹ bình ổn và ưu tiên hộ dân cư.", rationale: "Bảo vệ CPI, người dân không sốc giá.", previewAnimation: "money-flow", tone: "green", impact: { cpi: 0, cov: 2, roic: -4.5, bud: -10 }, logStr: "[EVN] Giữ nguyên giá. Hao hụt ngân sách lớn nhưng được lòng dân." },
      { label: "Tăng giá điện 10% — theo tín hiệu thị trường", description: "Cho giá tăng theo chi phí đầu vào, giữ dòng vốn cho hạ tầng.", rationale: "Bảo vệ dòng vốn, nhưng lạm phát sẽ leo thang.", previewAnimation: "rising-chart", tone: "orange", impact: { cpi: 2.5, cov: -5, roic: 3.0, bud: 0 }, logStr: "[EVN] Tăng giá điện 10%. ROIC phục hồi nhưng lạm phát tăng mạnh." }
    ]
  },
  {
    id: 2, entity: "PVN", entityColor: "#7dd3fc", entityBg: "rgba(125,211,252,0.12)",
    title: "Giá dầu Brent lao dốc −38%",
    description: "Giàn khai thác ngoài khơi hoạt động trong thị trường dầu lạnh băng, ngân sách hụt nhịp thu lớn.",
    desc: "Ngân sách nhà nước hụt thu trầm trọng do dầu thế giới sụt giảm. Sức ép duy trì quy mô thu ngân sách đang đè nặng lên PVN.",
    background: "oil.webp",
    type: "oil",
    intensity: "medium",
    sceneLabel: "Giàn khoan dầu khí",
    options: [
      { label: "Ép khai thác tăng 20% — cứu ngân sách", description: "Đẩy sản lượng tức thời để bù hụt thu, bất chấp biên khai thác xấu.", rationale: "Chi phí bơm hút cao làm giảm ROIC dài hạn.", previewAnimation: "money-flow", tone: "green", impact: { cpi: 0.5, cov: 0, roic: -2.0, bud: 20 }, logStr: "[PVN] Ép sản lượng tối đa. Cứu được ngân sách nhưng biên lợi nhuận mỏ giảm." },
      { label: "Cắt sản lượng — bảo tồn mỏ, chờ giá phục hồi", description: "Hạ nhịp khai thác, giữ tài sản mỏ và chịu áp lực ngân sách ngắn hạn.", rationale: "Mất nguồn thu ngân sách, một số chương trình an sinh bị hoãn.", previewAnimation: "falling-chart", tone: "blue", impact: { cpi: 0, cov: -4, roic: 1.5, bud: -10 }, logStr: "[PVN] Bảo tồn mỏ. Hiệu quả vốn giữ được, nhưng Nhà nước thâm hụt tài chính." }
    ]
  },
  {
    id: 3, entity: "VNPT", entityColor: "#86efac", entityBg: "rgba(134,239,172,0.12)",
    title: "Tiên phong phủ sóng 5G vùng lõm",
    description: "Các tháp viễn thông vùng núi chớp tín hiệu yếu, còn bản đồ phủ sóng quốc gia vẫn còn khoảng trống.",
    desc: "Chính phủ yêu cầu phủ sóng 100% vùng sâu bất chấp lỗ. Biên lợi nhuận vùng viễn thông núi đồi và hải đảo hoàn toàn âm.",
    background: "telecom.webp",
    type: "telecom",
    intensity: "low",
    sceneLabel: "Hạ tầng viễn thông",
    options: [
      { label: "Dùng 100% vốn tập đoàn triển khai thần tốc", description: "Đổ vốn chủ lực vào điểm lõm, kéo tín hiệu tới vùng sâu ngay lập tức.", rationale: "Chỉ số an sinh tăng vọt nhưng Ngân sách và ROIC đổ máu.", previewAnimation: "network", tone: "green", impact: { cpi: 0, cov: 6, roic: -4.0, bud: -12 }, logStr: "[VNPT] Phủ sóng thành công bằng vốn chủ. Cáp viễn thông tới tận bản làng." },
      { label: "Hợp tác Viettel/MobiFone dùng chung hạ tầng", description: "Ghép mạng lõi, chia trạm và giảm chi phí triển khai từng vùng.", rationale: "Tiết kiệm ngân sách nhưng tiến độ phủ sóng chậm hơn.", previewAnimation: "network", tone: "blue", impact: { cpi: 0.5, cov: 2, roic: 1.0, bud: -5 }, logStr: "[VNPT] Liên minh dùng chung cáp. Ngân sách an toàn, độ phủ tăng vừa phải." }
    ]
  },
  {
    id: 4, entity: "NHNN", entityColor: "#f4a7aa", entityBg: "rgba(195,40,45,0.15)",
    title: "Nợ xấu ngân hàng sau đại dịch",
    description: "Sàn tài chính nhấp nháy đỏ, dòng tín dụng co lại và hệ thống ngân hàng quốc doanh đứng trước lựa chọn đau.",
    desc: "Các doanh nghiệp nhỏ kiệt quệ kéo theo nợ xấu ngân hàng quốc doanh tăng. Một gói cứu trợ khẩn cấp đang được xem xét.",
    background: "finance.webp",
    type: "economic",
    intensity: "high",
    sceneLabel: "Trung tâm tài chính",
    options: [
      { label: "Bơm ngân sách mua nợ xấu qua VAMC", description: "Hấp thụ nợ xấu để tín dụng chảy lại, đổi bằng áp lực ngân khố.", rationale: "Giải cứu dòng tín dụng, nhưng tiêu tốn ngân sách quốc gia.", previewAnimation: "money-flow", tone: "green", impact: { cpi: -0.5, cov: 3, roic: -1.0, bud: -12 }, logStr: "[NHNN] Bơm tiền mua nợ xấu. Doanh nghiệp dễ thở hơn nhưng ngân khố vơi đi." },
      { label: "Siết tín dụng, yêu cầu tự xử lý nợ", description: "Bảo toàn ngân sách, khóa thanh khoản yếu và để thị trường tự thanh lọc.", rationale: "Bảo toàn quỹ quốc gia, nhưng hệ lụy phá sản diện rộng.", previewAnimation: "falling-chart", tone: "red", impact: { cpi: 1.0, cov: -6, roic: 2.5, bud: 0 }, logStr: "[NHNN] Siết hệ thống tín dụng. Lãi suất đè nặng, doanh nghiệp vỡ nợ diện rộng." }
    ]
  },
  {
    id: 5, entity: "TKV", entityColor: "#f2c14e", entityBg: "rgba(242,193,78,0.15)",
    title: "Nguy cơ đứt gãy chuỗi than",
    description: "Mỏ hầm lò nóng lên, băng tải than rung giật và nhà máy điện phía Bắc chờ từng chuyến nhiên liệu.",
    desc: "Chi phí khai thác than hầm lò tăng vọt, đe dọa trực tiếp tới đà sản xuất và cung ứng điện lưới cho toàn miền Bắc.",
    background: "coal.webp",
    type: "coal",
    intensity: "medium",
    sceneLabel: "Chuỗi cung ứng than",
    options: [
      { label: "Xuất ngân sách bình ổn giá vật tư mỏ", description: "Ổn định vật tư đầu vào, giữ than ra lò và giảm sốc giá điện dây chuyền.", rationale: "Tránh tăng giá điện thứ cấp, nhưng hao hụt quỹ quốc gia.", previewAnimation: "money-flow", tone: "green", impact: { cpi: 0.5, cov: 4, roic: -2.0, bud: -8 }, logStr: "[TKV] Quỹ nhà nước can thiệp bình ổn vật tư. Than tiếp tục ra lò, điện được cứu." },
      { label: "Buông giá than, ép EVN và thị trường gánh", description: "Thả giá nhiên liệu theo thị trường, cứu biên lợi nhuận mỏ nhưng tạo sóng giá.", rationale: "Giá cả hàng hóa nảy số, dân cư bất bình nhưng ROIC mỏ được giữ.", previewAnimation: "rising-chart", tone: "orange", impact: { cpi: 1.5, cov: -5, roic: 3.0, bud: 0 }, logStr: "[TKV] Buông giá than tự do. Dây chuyền sản xuất trụ lại nhưng lạm phát leo thang." }
    ]
  },
  {
    id: 6, entity: "VNA", entityColor: "#7dd3fc", entityBg: "rgba(125,211,252,0.12)",
    title: "Đề án Giải cứu Hàng không Quốc gia",
    description: "Bảng bay quốc gia nhấp nháy cảnh báo, đường bay công ích thưa dần và thanh khoản rơi khỏi vùng an toàn.",
    desc: "Vietnam Airlines đứng trên bờ vực mất thanh khoản. Hệ thống hàng không công ích tới các vùng sâu có nguy cơ đóng cửa.",
    background: "aviation.webp",
    type: "aviation",
    intensity: "high",
    sceneLabel: "Mạng bay quốc gia",
    options: [
      { label: "Bơm khẩn 12.000 tỷ cứu hãng bay quốc gia", description: "Bắc cầu vốn, giữ đường bay công ích và tránh đứt mạng hàng không.", rationale: "Giữ lại thương hiệu và đường bay công ích, kéo lùi hiệu quả chung.", previewAnimation: "air-bridge", tone: "blue", impact: { cpi: 0, cov: 2, roic: -5.0, bud: -15 }, logStr: "[VNA] Bơm vốn khẩn cấp. Hàng không Nhà nước thoát thảm, ngân khố trả giá đắt." },
      { label: "Thoái vốn, để thị trường đào thải khốc liệt", description: "Rút khỏi gánh lỗ, chấp nhận cú sốc lao động và mạng bay co lại.", rationale: "Hàng chục ngàn nhân sự mất việc, nhưng cắt lỗ thành công.", previewAnimation: "falling-chart", tone: "red", impact: { cpi: -0.5, cov: -7, roic: 4.0, bud: 5 }, logStr: "[VNA] Đạp phanh thoái vốn. Cú sốc thất nghiệp ập tới, nhưng túi tiền Nhà nước an toàn." }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// BLACK SWANS & POLICIES
// ═══════════════════════════════════════════════════════════════════════════
const BLACK_SWANS = [
  {
    title: "Bão Siêu Cấp Miền Trung",
    description: "Mắt bão quét qua miền Trung, lưới điện và cáp quang cùng mất nhịp trong một đêm.",
    background: "storm.webp",
    type: "storm",
    intensity: "high",
    sceneLabel: "Ứng phó thiên tai",
    emoji: "🌪️",
    modeNote: "Biến cố chen ngang: xử lý xong vẫn tiếp tục quý hiện tại.",
    desc: "Bão tàn phá hạ tầng cáp quang và nhà máy điện. Hàng triệu người mất kết nối. Trạng thái khẩn cấp được kích hoạt.",
    impact: { cpi: 1.0, cov: -6, roic: -3.0, bud: -10 },
    logStr: "[⚠ TAI ƯƠNG] Bão siêu cấp tàn phá hạ tầng. An sinh xã hội lùi bước."
  },
  {
    title: "Đứt Gãy Vận Tải Biển",
    description: "Tín hiệu hàng hải toàn cầu đỏ rực, chi phí nhiên liệu và logistics kéo lạm phát nhập khẩu lên cao.",
    background: "shipping.webp",
    type: "shipping",
    intensity: "high",
    sceneLabel: "Vận tải biển toàn cầu",
    emoji: "🚢",
    modeNote: "Biến cố chen ngang: cú sốc logistics tác động ngay vào chỉ số vĩ mô.",
    desc: "Xung đột địa chính trị làm đóng cửa eo biển. Chi phí nhập khẩu dầu, than đá bay xa, lạm phát nhập khẩu dâng cao.",
    impact: { cpi: 2.0, cov: -2, roic: 0, bud: 0 },
    logStr: "[⚠ TAI ƯƠNG] Đứt gãy vận tải toàn cầu! Bóng ma lạm phát bao trùm nền kinh tế."
  },
  {
    title: "Phát Minh Viễn Thông 6G",
    description: "Phòng thí nghiệm lõi phát sáng, tín hiệu 6G mở khóa dòng vốn công nghệ mới.",
    background: "telecom.webp",
    type: "tech",
    intensity: "low",
    sceneLabel: "Đột phá công nghệ",
    emoji: "💡",
    modeNote: "Biến cố chen ngang tích cực: cơ hội công nghệ có thể cứu hiệu quả vốn.",
    desc: "Nhóm kỹ sư nội địa làm chủ thành công công nghệ phát sóng không gian. Quỹ đầu tư ngoại ồ ạt bơm tiền vào tập đoàn.",
    impact: { cpi: -0.5, cov: 1, roic: 5.0, bud: 10 },
    logStr: "[✓ KỲ TÍCH] Đột phá công nghệ lõi. Mạch máu vốn ngoại nuôi dưỡng ROIC."
  }
];

const MACRO_POLICIES = [
  {
    id: "p_ppp", icon: "🤝", title: "Kết nối Đối tác Công – Tư",
    desc: "Mở nút thắt cho phép nhà nước thuê hạ tầng tư nhân. Sau những mất mát đầu tư, hiệu quả vốn sẽ phục hồi và bù đắp +1.5 ROIC.",
    effect: "Hiệu lực dài hạn: nếu quyết định làm tăng An sinh, ROIC được bù thêm +1.5%.",
    isBuff: "roic",
    summary: "+1.5% ROIC"
  },
  {
    id: "p_stabilize", icon: "⚖️", title: "Thiết quân luật Bình ổn Giá",
    desc: "Siết chặt mọi khung giá thiết yếu. Trực tiếp cắt giảm đà tăng lạm phát -0.4% mỗi quý, đổi lại doanh nghiệp mất máu lợi nhuận.",
    effect: "Hiệu lực dài hạn: sau mỗi quyết định thường, CPI -0.4% nhưng ROIC -0.4%.",
    isBuff: "cpi",
    summary: "CPI -0.4%, ROIC -0.4%"
  },
  {
    id: "p_tax", icon: "🏛️", title: "Sắc thuế Thu lợi Siêu Ngạch",
    desc: "Truy thu lợi nhuận đột biến. Giải khát ngân khố nhà nước ngay +40 Tỷ USD, nhưng dân cư và xã hội chịu bóp nghẹt (-3 An sinh).",
    effect: "Hiệu lực tức thời: Ngân khố +40 tỷ, An sinh -3%.",
    isBuff: "bud",
    summary: "+40 tỷ NS, -3% An sinh"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS & METER DEFS
// ═══════════════════════════════════════════════════════════════════════════
const METER_DEFS = [
  {
    key: "cpi", label: "Lạm phát", icon: "📈", limit: "Tối đa: 8.0%", markerPos: 80,
    hint: "CPI tăng cao làm giá cả mất kiểm soát. Giữ CPI thấp giúp ổn định đời sống.",
    getWidth: (v) => Math.min(Math.max((v / 10) * 100, 2), 100),
    getColor: (v) => (v >= 7.5 ? "#ef4444" : v >= 6.0 ? "#f59e0b" : "#10b981"),
    format: (v) => v.toFixed(1) + "%", danger: (v) => v >= 7.0,
  },
  {
    key: "cov", label: "An sinh", icon: "🏥", limit: "Tối thiểu: 70%", markerPos: 40,
    hint: "An sinh phản ánh khả năng bảo vệ người dân và dịch vụ công ích.",
    getWidth: (v) => Math.min(Math.max((v - 50) / 50 * 100, 2), 100),
    getColor: (v) => (v <= 74 ? "#ef4444" : v <= 82 ? "#f59e0b" : "#10b981"),
    format: (v) => v.toFixed(0) + "%", danger: (v) => v <= 74,
  },
  {
    key: "roic", label: "Hiệu quả vốn", icon: "💰", limit: "Tối thiểu: -5%", markerPos: 25,
    hint: "ROIC đo hiệu quả sử dụng vốn của doanh nghiệp nhà nước.",
    getWidth: (v) => Math.min(Math.max(((v + 10) / 20) * 100, 2), 100),
    getColor: (v) => (v <= -2.0 ? "#ef4444" : v <= 1.5 ? "#f59e0b" : "#10b981"),
    format: (v) => v.toFixed(1) + "%", danger: (v) => v <= -2.0,
  },
  {
    key: "bud", label: "Ngân khố", icon: "🏦", limit: "Tối thiểu: 0", markerPos: 5,
    hint: "Ngân khố là dư địa tài khóa để bình ổn, cứu trợ và đầu tư.",
    getWidth: (v) => Math.min(Math.max(v, 2), 100),
    getColor: (v) => (v <= 20 ? "#ef4444" : v <= 50 ? "#f59e0b" : "#10b981"),
    format: (v) => v.toFixed(0) + " tỷ", danger: (v) => v <= 20,
  }
];

function getFeedbackTone(impact = {}) {
  const risk =
    (impact.cpi > 1 ? 2 : impact.cpi > 0 ? 1 : 0) +
    (impact.cov < -2 ? 2 : impact.cov < 0 ? 1 : 0) +
    (impact.roic < -2 ? 2 : impact.roic < 0 ? 1 : 0) +
    (impact.bud < -10 ? 2 : impact.bud < 0 ? 1 : 0);
  const relief =
    (impact.cpi < 0 ? 1 : 0) +
    (impact.cov > 0 ? 1 : 0) +
    (impact.roic > 0 ? 1 : 0) +
    (impact.bud > 0 ? 1 : 0);

  return risk > relief ? "bad" : "good";
}

function calculateLeadershipStyle(stats, history) {
  // Simple logic to categorize the player based on final results
  if (stats.cov >= 95 && stats.roic <= 1) return {
    label: "LÃNH ĐẠO DÂN TUÝ",
    style: "populist",
    desc: "Bạn đặt con người lên trên hết. Mọi chính sách đều hướng về an sinh, dù đôi khi làm 'tuột xích' dòng vốn kinh tế."
  };
  if (stats.roic >= 6 && stats.cov <= 80) return {
    label: "NHÀ KỸ TRỊ QUYẾT ĐOÁN",
    style: "technocrat",
    desc: "Bạn ưu tiên hiệu suất và tích lũy. Nền kinh tế tăng trưởng mạnh mẽ nhưng xã hội đang chịu áp lực lớn từ sự đánh đổi."
  };
  if (stats.cpi <= 4 && stats.bud >= 60 && stats.cov >= 85) return {
    label: "TINH ANH QUẢN TRỊ",
    style: "elite",
    desc: "Sự cân bằng tuyệt mỹ. Bạn điều hành đất nước bằng bàn tay sắt bọc nhung, giữ vững mọi chỉ số trong tầm kiểm soát."
  };
  if (stats.cpi >= 7) return {
    label: "ĐIỀU HÀNH THỰC DỤNG",
    style: "pragmatist",
    desc: "Bạn chấp nhận rủi ro lạm phát để cứu vãn các mục tiêu khác. Một lựa chọn đầy hơi thở thực tế trong bối cảnh bão tố."
  };
  return {
    label: "THUYỀN TRƯỞNG BỀN BỈ",
    style: "stable",
    desc: "Vượt qua 12 quý đầy sóng gió. Bạn giữ được sự ổn định cho quốc gia, không quá cực đoan về bất cứ phe phái nào."
  };
}

function CompactStatPill({ def, value }) {
  const danger = def.danger(value);
  const color = def.getColor(value);
  const progressWidth = def.getWidth(value);

  return (
    <div
      className={`psim-stat-pill ${danger ? "is-danger" : ""}`}
      title={`${def.hint}`}
    >
      <div className="psim-stat-pill-main">
        <span className="psim-stat-pill-icon">{def.icon}</span>
        <div className="psim-stat-pill-info">
          <span className="psim-stat-pill-label">{def.label}</span>
          <span className="psim-stat-pill-threshold" style={{ color: danger ? "#fca5a5" : "#94a3b8" }}>{def.limit}</span>
        </div>
        <span className="psim-stat-pill-value" style={{ color: danger ? "#ef4444" : color }}>
          {def.format(value)}
        </span>
      </div>
      <div className="psim-stat-pill-bar-bg">
        <div 
          className="psim-stat-pill-bar-fill" 
          style={{ width: `${progressWidth}%`, backgroundColor: color }}
        />
        <div className="psim-stat-pill-marker" style={{ left: `${def.markerPos}%` }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — PolicySimGame
// ═══════════════════════════════════════════════════════════════════════════
function PolicySimGame() {
  const INIT_STATS = { cpi: 3.8, cov: 90, roic: 5.0, bud: 100 };
  const INIT_LOGS = [
    "$ khởi-động --mô-phỏng-chính-sách --quốc-gia VN --phiên-bản V3",
    "› [KHỞI TẠO] Module Ngân khố, Cây Chính sách & Thiên Nga Đen đã sẵn sàng.",
    "› Quý 1/12 đã sẵn sàng chờ lệnh điều hành."
  ];

  const [gameState, setGameState] = useState("start");
  const [quarter, setQuarter] = useState(1);
  const [stats, setStats] = useState(INIT_STATS);
  const [history, setHistory] = useState([INIT_STATS]);
  const [logs, setLogs] = useState(INIT_LOGS);
  const [eventIndex, setEventIndex] = useState(0);
  const [activePolicies, setActivePolicies] = useState([]);

  const [shuffledEvents, setShuffledEvents] = useState(shuffleArray(GAME_EVENTS));

  useEffect(() => {
    loadGame(setGameState, setQuarter, setStats, setHistory, setLogs, setEventIndex, setActivePolicies);
  }, []);

  const [currentBlackSwan, setCurrentBlackSwan] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [executingLabel, setExecutingLabel] = useState("");
  const consoleRef = useRef(null);
  const outcomeTimerRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => () => {
    if (outcomeTimerRef.current) window.clearTimeout(outcomeTimerRef.current);
  }, []);

  const showOutcome = (payload) => {
    if (outcomeTimerRef.current) window.clearTimeout(outcomeTimerRef.current);
    setLastOutcome({ id: Date.now(), ...payload });
    outcomeTimerRef.current = window.setTimeout(() => setLastOutcome(null), 3400);
  };

  const resetGame = () => {
    SFX.bgm(false);
    setGameState("start");
    setQuarter(1); setStats(INIT_STATS); setHistory([INIT_STATS]);
    setLogs(INIT_LOGS); setEventIndex(0); setActivePolicies([]);
    setShuffledEvents(shuffleArray(GAME_EVENTS));
    setCurrentBlackSwan(null); setTransitioning(false); setFeedback(null); setLastOutcome(null);
    localStorage.removeItem(SAVE_KEY);
  };

  const commitTurn = (newStats, logStrings, stayPhase = false) => {
    let fStats = { ...newStats };
    if (!stayPhase && activePolicies.includes("p_stabilize")) {
      fStats.cpi = Math.max(0, parseFloat((fStats.cpi - POLICY_STABILIZE_CPI_REDUCTION).toFixed(2)));
      fStats.roic = parseFloat((fStats.roic - POLICY_STABILIZE_ROIC_PENALTY).toFixed(2));
      logStrings = [...logStrings, "[HIỆU LỰC ĐẠO LUẬT] Bình ổn giá giảm CPI 0.4%, nhưng ROIC hao 0.4%."];
    }

    setStats(fStats);
    setHistory(p => [...p, fStats]);
    setLogs(p => [...p, ...logStrings]);

    setTimeout(() => saveGame(gameState, quarter, fStats, history, logs, eventIndex, activePolicies), 0);

    // Check End
    let nextSt = "playing"; let sLog = null;
    if (fStats.cpi >= 8.0) { nextSt = "gameover_cpi"; sLog = "[SỰ CỐ NGHIÊM TRỌNG] Lạm phát tàn bạo. Nền kinh tế phi mã."; SFX.lose(); }
    else if (fStats.cov <= 70) { nextSt = "gameover_cov"; sLog = "[SỰ CỐ NGHIÊM TRỌNG] An sinh xã hội đứt gãy. Đóng băng phúc lợi."; SFX.lose(); }
    else if (fStats.roic <= -5.0) { nextSt = "gameover_roic"; sLog = "[SỰ CỐ NGHIÊM TRỌNG] Hiệu quả vốn bốc hơi. Tập đoàn sụp đổ."; SFX.lose(); }
    else if (fStats.bud <= 0) { nextSt = "gameover_bud"; sLog = "[SỰ CỐ NGHIÊM TRỌNG] Ngân khố trống rỗng. Mất thanh khoản quốc gia."; SFX.lose(); }
    else if (quarter >= 12) {
      if (fStats.cov > 90 && fStats.roic > 0 && fStats.cpi < 6) nextSt = "won_perfect";
      else if (fStats.cov >= 95 && fStats.roic <= 0) nextSt = "won_populist";
      else if (fStats.cov <= 75 && fStats.roic >= 5) nextSt = "won_capitalist";
      else nextSt = "won_normal";
      sLog = "[HỆ THỐNG] ✓ Hoàn tất 12 quý điều hành. Đánh giá thành tích.";
      SFX.win();
    }

    if (sLog) setLogs(p => [...p, sLog]);

    if (nextSt !== "playing") {
      SFX.bgm(false);
      setGameState(nextSt); setTransitioning(false); return;
    }
    if (stayPhase) {
      setGameState("playing"); setTransitioning(false); return;
    }

    setTimeout(() => {
      const nQ = quarter + 1;
      setQuarter(nQ);
      setEventIndex(p => p + 1);

      if (nQ === 4 || nQ === 8) {
        setGameState("policy");
        setLogs(p => [...p, `› [PHIÊN HỌP LƯỠNG VIỆN] Mở khoá ban hành Nghị Quyết vĩ mô.`]);
      } else {
        if (Math.random() < BLACK_SWAN_SPAWN_RATE && nQ < 12) {
          const swan = BLACK_SWANS[Math.floor(Math.random() * BLACK_SWANS.length)];
          setCurrentBlackSwan(swan);
          setGameState("blackswan");
          setLogs(p => [...p, `› [⚠️ CẢNH BÁO TỐI KHẨN CẤP] Biến cố chen ngang xuất hiện, cần xử lý trước khi tiếp tục quý hiện tại.`]);
          SFX.alert();
        } else {
          setGameState("playing");
          const ev = shuffledEvents[(eventIndex + 1) % shuffledEvents.length];
          setLogs(p => [...p, `› QUÝ ${nQ}/12 — Báo cáo từ ${ev.entity}: ${ev.title}`]);
        }
      }
      setTransitioning(false);
    }, 800);
  };

  const handleChoice = (opt) => {
    if (transitioning) return;
    SFX.confirm();
    setTransitioning(true);
    setExecutingLabel(`Đang thực thi: ${opt.label}...`);
    setFeedback({ id: `${Date.now()}-${opt.label}`, tone: getFeedbackTone(opt.impact) });
    window.setTimeout(() => setFeedback(null), 900);
    let imp = { ...opt.impact };
    if (activePolicies.includes("p_ppp") && imp.cov > 0) imp.roic += POLICY_PPP_ROIC_BUFF;

    const ns = {
      cpi: parseFloat((stats.cpi + imp.cpi).toFixed(2)),
      cov: parseFloat((stats.cov + imp.cov).toFixed(1)),
      roic: parseFloat((stats.roic + imp.roic).toFixed(2)),
      bud: parseFloat((stats.bud + imp.bud).toFixed(1)),
    };
    showOutcome({
      kind: "Báo cáo sau quyết định",
      title: opt.label,
      tone: getFeedbackTone(opt.impact),
      before: stats,
      after: ns,
    });
    const dLog = `   CPI ${stats.cpi}→${ns.cpi}  |  An sinh ${stats.cov}→${ns.cov}%  |  NS ${stats.bud}→${ns.bud}`;
    window.setTimeout(() => {
      setExecutingLabel("");
      commitTurn(ns, [opt.logStr, dLog]);
    }, 1200);
  };

  const handlePolicy = (pol) => {
    SFX.law();
    setActivePolicies(p => [...p, pol.id]);
    setExecutingLabel(`Ban hành đạo luật: ${pol.title}...`);
    window.setTimeout(() => {
      setExecutingLabel("");
      setGameState("playing");
      setLogs(p => [...p, `[ĐẠO LUẬT] Ký sắc lệnh: ${pol.title}`]);
      if (pol.id === "p_tax") {
        const ns = { ...stats, bud: stats.bud + POLICY_TAX_BUDGET_BOOST, cov: stats.cov - POLICY_TAX_WELFARE_PENALTY };
        showOutcome({
          kind: "Hiệu lực đạo luật",
          title: pol.title,
          tone: getFeedbackTone({ cpi: 0, cov: -3, roic: 0, bud: 40 }),
          before: stats,
          after: ns,
        });
        commitTurn(ns, ["[THỰC THI] Ngân khố +40 tỷ. Sự phẫn nộ đẩy An sinh lùi 3%."], true);
      }
    }, 1200);
  };

  const handleBlackSwanAck = () => {
    if (transitioning || !currentBlackSwan) return;
    SFX.confirm();
    setTransitioning(true);
    const sw = currentBlackSwan;
    setExecutingLabel(`Phản ứng biến cố: ${sw.title}...`);
    const swanTone = getFeedbackTone(sw.impact);
    setFeedback({ id: `${Date.now()}-${sw.title}`, tone: swanTone });
    window.setTimeout(() => setFeedback(null), 900);
    const ns = {
      cpi: parseFloat((stats.cpi + sw.impact.cpi).toFixed(2)),
      cov: parseFloat((stats.cov + sw.impact.cov).toFixed(1)),
      roic: parseFloat((stats.roic + sw.impact.roic).toFixed(2)),
      bud: parseFloat((stats.bud + sw.impact.bud).toFixed(1)),
    };
    showOutcome({
      kind: swanTone === "good" ? "Cơ hội từ biến cố" : "Thiệt hại từ biến cố",
      title: sw.title,
      tone: swanTone,
      before: stats,
      after: ns,
    });
    window.setTimeout(() => {
      setExecutingLabel("");
      setCurrentBlackSwan(null);
      commitTurn(ns, [sw.logStr], true);
    }, 1200);
  };

  // Màn hình Game Over / Win Premium
  const EndScreen = () => {
    const isWin = gameState.startsWith("won");
    const dict = {
      won_perfect: { i: "👑", c: "#10b981", t: "Kỹ Trị Xuất Chúng", d: "Đẳng cấp điều hành kinh điển. Mác-Lênin cho rằng Nhà nước điều tiết tinh anh nhất là bảo vệ được song song tích luỹ vốn và bao bọc toàn dân." },
      won_populist: { i: "🤝", c: "#f59e0b", t: "Nhà Lãnh Đạo Dân Tuý", d: "Phúc lợi bủa vây mọi ngóc ngách, tuy nhiên dòng vốn cạn kiệt. Doanh nghiệp sẽ sớm không còn sức chống đỡ chu kỳ suy thoái tiếp theo." },
      won_capitalist: { i: "🎩", c: "#3b82f6", t: "Vòng Xoáy Tư Bản", d: "Tích tụ tư bản tối đa theo đúng luận điểm Lênin. Nhưng mặt trái là hố sâu bất bình đẳng và chỉ số an sinh lún sâu." },
      won_normal: { i: "🎖️", c: "#f1f5f9", t: "Thuyền Trưởng Bền Bỉ", d: "Vượt 12 Quý bão tố. Không tột đỉnh vinh quang nhưng giữ được con tàu vượt trùng khơi." }
    };
    const loss = {
      gameover_cpi: { i: "💥", t: "Bão Lạm Phát", d: "Nền kinh tế bong bóng sụp đổ. Đồng tiền mất giá khiến toàn bộ nỗ lực an sinh biến thành tro bụi." },
      gameover_cov: { i: "📉", t: "Xã Hội Đứt Gãy", d: "Bạn quên mất chức năng nền tảng của kinh tế Nhà nước không thuần tuý là tích luỹ." },
      gameover_roic: { i: "💸", t: "Phá Sản Doanh Nghiệp", d: "Tiêu hao toàn bộ năng lượng tự chủ. Các Tập đoàn không còn là trụ cột mà trở thành hố đen nền kinh tế." },
      gameover_bud: { i: "🏛️", t: "Vỡ Nợ Quốc Gia", d: "Táo bạo nhưng không có điểm dừng. Bơm cứu trợ vô độ làm rỗng ruột Kho bạc Nhà nước." }
    };
    const c = isWin ? dict[gameState] : { ...loss[gameState], c: "#ef4444" };
    const style = isWin ? calculateLeadershipStyle(history[history.length - 1], history) : null;

    return (
      <div style={{ animation: "fadeSlide 0.8s cubic-bezier(0.16,1,0.3,1)", padding: "10px" }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: "999px", background: `${c.c}15`, color: c.c, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.8rem" }}>
            {isWin ? "NHIỆM KỲ HOÀN TẤT" : "ĐÌNH CHỈ CÔNG TÁC"}
          </div>
          {style && (
            <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", color: "white", fontWeight: 900, fontSize: "0.8rem", letterSpacing: "0.05em" }}>
              💎 {style.label}
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "5rem", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>{c.i}</span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "white", margin: 0, lineHeight: 1.1, fontFamily: "Manrope", fontWeight: 900 }}>{c.t}</h1>
        </div>
        <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "600px", fontFamily: "Source Serif 4, serif", marginBottom: "24px" }}>
          {style ? style.desc : c.d}
        </p>

        <div style={{ display: "flex", gap: "24px", marginTop: "32px", padding: "24px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
          {[
            { l: "Lạm phát", v: history[history.length - 1].cpi.toFixed(1) + "%", c: "#f59e0b" },
            { l: "An sinh xã hội", v: history[history.length - 1].cov.toFixed(0) + "%", c: "#10b981" },
            { l: "Chỉ số ROIC", v: history[history.length - 1].roic.toFixed(1) + "%", c: "#3b82f6" },
            { l: "Ngân khố (Tỷ USD)", v: history[history.length - 1].bud.toFixed(0), c: "#ef4444" }
          ].map(s => (
            <div key={s.l} style={{ flex: 1, minWidth: "120px" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.05em" }}>{s.l}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { initAudio(); SFX.click(); resetGame(); }} style={{ marginTop: "40px", padding: "18px 40px", borderRadius: "16px", border: "none", background: "linear-gradient(145deg, #c3282d, #8b0e12)", color: "white", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.05em", cursor: "pointer", boxShadow: "0 10px 30px rgba(195,40,45,0.4)", transition: "transform 0.2s" }} onMouseOver={e => { SFX.hover(); e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
          🔄 ỦY NHIỆM LẠI TỪ QUÝ 1
        </button>
      </div>
    );
  };

  // UI Framework
  const pgStyle = { minHeight: "100dvh", background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", display: "flex", flexDirection: "column", color: "white", fontFamily: "Manrope, sans-serif" };
  const navStyle = { padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(10px)" };

  if (gameState === "start") {
    return (
      <div style={{ ...pgStyle, justifyContent: "center", alignItems: "center", position: "relative", overflow: "hidden", padding: "40px 20px" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(195,40,45,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ zIndex: 10, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(20px)", padding: "clamp(32px, 5vw, 64px)", borderRadius: "32px", border: "1px solid rgba(255,255,255,0.08)", maxWidth: "850px", textAlign: "center", boxShadow: "0 40px 100px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: "999px", background: "rgba(30,127,212,0.15)", color: "#3b82f6", fontWeight: 900, marginBottom: "20px", letterSpacing: "0.1em", fontSize: "0.8rem" }}>NHÓM 4 MLN122</div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.1, background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            MÔ PHỎNG VĨ MÔ
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#94a3b8", marginBottom: "32px", lineHeight: 1.7, fontFamily: "Source Serif 4, serif", maxWidth: "90%" }}>
            Bạn là người điều hành vĩ mô trong 12 Quý. Nhiệm vụ của bạn là đưa ra các quyết định chính sách đối phó với khủng hoảng và <b>Thiên Nga Đen</b>, đồng thời duy trì cân bằng các chỉ số quốc gia.
          </p>

          <div style={{ display: "flex", gap: "12px", marginBottom: "32px", width: "100%", justifyContent: "space-between" }}>
            {[
              { i: "📈", l: "LẠM PHÁT", d: "Kiểm soát giá cả", w: "Thua nếu ≥ 8.0%", c: "#f59e0b" },
              { i: "🏥", l: "AN SINH", d: "Phúc lợi xã hội", w: "Thua nếu ≤ 70%", c: "#10b981" },
              { i: "💰", l: "ROIC", d: "Hiệu quả vốn", w: "Thua nếu ≤ −5%", c: "#3b82f6" },
              { i: "🏦", l: "NGÂN KHỐ", d: "NSNN (Tỷ $)", w: "Thua nếu ≤ 0", c: "#ef4444" }
            ].map(k => (
              <div key={k.l} style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.03)", padding: "12px 8px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.5rem" }}>{k.i}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: k.c, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>{k.l}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.3, whiteSpace: "nowrap" }}>{k.d}</div>
                <div style={{ fontSize: "0.7rem", color: "#ef4444", fontWeight: 700, opacity: 0.8, whiteSpace: "nowrap" }}>{k.w}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(30,127,212,0.05)", border: "1px solid rgba(30,127,212,0.2)", borderRadius: "16px", padding: "20px 24px", textAlign: "left", marginBottom: "40px", width: "100%", boxSizing: "border-box" }}>
            <h3 style={{ margin: "0 0 12px 0", color: "#60a5fa", fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}><span>📖</span> HƯỚNG DẪN CƠ BẢN</h3>
            <ul style={{ margin: 0, paddingLeft: "24px", color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.6, fontFamily: "Source Serif 4, serif" }}>
              <li style={{ marginBottom: "8px" }}>Mỗi Quý bạn sẽ đối mặt với một chính sách, hoặc một sự kiện <b>Thiên Nga Đen</b> căng thẳng.</li>
              <li style={{ marginBottom: "8px" }}>Quyết định đưa ra luôn phải đánh đổi: ví dụ bảo vệ <b>An sinh</b> thường lấy đi <b>Ngân khố</b>.</li>
              <li style={{ marginBottom: "8px" }}>Ở <b>Quý 4</b> và <b>Quý 8</b>, bạn được quyền ưu tiên ban hành 1 <b>Đạo luật Vĩ mô</b> để hỗ trợ nền kinh tế.</li>
              <li>Mục tiêu: Sống sót qua <b>12 Quý</b> mà không để chỉ số nào chạm ngưỡng báo động đỏ. Tùy theo các chỉ số khi kết thúc, bạn sẽ đạt được các danh hiệu khác nhau.</li>
            </ul>
          </div>

          <button onClick={() => { initAudio(); SFX.click(); SFX.bgm(true); setGameState("playing"); }} style={{ padding: "20px 48px", background: "linear-gradient(135deg, #c3282d, #8b0e12)", color: "white", border: "none", borderRadius: "16px", fontSize: "1.1rem", fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 20px 50px rgba(195,40,45,0.4)", transition: "all 0.3s" }} onMouseOver={e => { SFX.hover(); e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 30px 60px rgba(195,40,45,0.6)"; }} onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(195,40,45,0.4)" }}>
            VÀO PHÒNG ĐIỀU HÀNH
          </button>
        </div>
      </div>
    );
  }

  const currentEvent = shuffledEvents[eventIndex % shuffledEvents.length];
  const ce = currentEvent;
  const sceneEvent = gameState === "blackswan" && currentBlackSwan ? currentBlackSwan : ce;

  return (
    <div className="psim-cinema-root">
      <EffectOverlay feedback={feedback} />
      <OutcomePanel outcome={lastOutcome} />

      {/* ── Fullscreen Background Scene ── */}
      <EventScene event={sceneEvent} quarter={quarter} transitioning={transitioning} />

      {/* ── Top HUD Bar ── */}
      <header className="psim-hud-bar">
        <a
          href="#/"
          className="psim-hud-back"
          onClick={() => SFX.bgm(false)}
          onMouseOver={() => SFX.hover()}
        >
          ← RÚT LUI
        </a>

        <div className="psim-hud-timeline">
          {Array.from({ length: 12 }, (_, i) => i + 1).map(q => {
            const isPolicy = q === 4 || q === 8;
            const cls = q < quarter ? "done" : q === quarter ? "current" : "future";
            return (
              <span
                key={q}
                className={`psim-hud-dot ${cls} ${isPolicy ? "policy" : ""}`}
                title={isPolicy ? `Quý ${q}: Ban hành đạo luật` : `Quý ${q}`}
              >
                {isPolicy ? "⚖" : q}
              </span>
            );
          })}
        </div>

        <div className="psim-hud-stats">
          {METER_DEFS.map(def => (
            <CompactStatPill key={def.key} def={def} value={stats[def.key]} />
          ))}
          {activePolicies.length > 0 && (
            <div className="psim-hud-laws">
              {activePolicies.map(id => {
                const pol = MACRO_POLICIES.find(p => p.id === id);
                return pol ? (
                  <div key={id} className="psim-law-tag" title={pol.effect}>
                    <span className="psim-law-tag-icon">{pol.icon}</span>
                    <div className="psim-law-tag-content">
                      <span className="psim-law-tag-label">{pol.title}</span>
                      <span className="psim-law-tag-summary">{pol.summary}</span>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Implementation Status Message ── */}
      {executingLabel && (
        <div className="psim-status-msg">
          <span>{executingLabel}</span>
        </div>
      )}

      {/* ── Content Layer (overlaid on scene) ── */}
      <div className={`psim-cinema-content ${transitioning ? "is-frozen" : ""}`}>

        {/* PLAYING */}
        {gameState === "playing" && (
          <div className="psim-cinema-playing" aria-live="polite">
            <div className="psim-cinema-event-info">
              <div className="psim-cinema-badges">
                <span
                  className="psim-event-chip"
                  style={{ background: ce.entityBg, border: `1px solid ${ce.entityColor}40`, color: ce.entityColor }}
                >
                  {ce.entity}
                </span>
                <span className="psim-quarter-chip">QUÝ {quarter} / 12</span>
              </div>
              <h1 className="psim-cinema-title">{ce.title}</h1>
              <p className="psim-cinema-desc">{ce.desc || ce.description}</p>
            </div>
            <div className="psim-cinema-decisions">
              {ce.options.map((opt, i) => (
                <DecisionCard
                  key={`${ce.id}-${i}`}
                  option={opt}
                  index={i}
                  disabled={transitioning}
                  onHover={() => SFX.hover()}
                  onSelect={() => handleChoice(opt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* BLACK SWAN */}
        {gameState === "blackswan" && currentBlackSwan && (
          <div className="psim-cinema-playing" aria-live="assertive">
            <div className="psim-cinema-event-info">
              <div className="psim-cinema-badges">
                <span className="psim-crisis-label">⚠ THIÊN NGA ĐEN</span>
              </div>
              <h1 className="psim-cinema-title">{currentBlackSwan.title} {currentBlackSwan.emoji}</h1>
              <p className="psim-cinema-desc">{currentBlackSwan.desc || currentBlackSwan.description}</p>
              <ImpactPreview impact={currentBlackSwan.impact} showZero={false} />
            </div>
            <div className="psim-cinema-decisions psim-cinema-decisions--single">
              <button
                className="psim-crisis-button"
                type="button"
                disabled={transitioning}
                onClick={handleBlackSwanAck}
                onMouseOver={() => SFX.hover()}
              >
                {getFeedbackTone(currentBlackSwan.impact) === "good"
                  ? "✓ TIẾP NHẬN CƠ HỘI"
                  : "⚡ KÍCH HOẠT QUY TRÌNH CHỐNG CHỊU"}
              </button>
            </div>
          </div>
        )}

        {/* POLICY */}
        {gameState === "policy" && (
          <div className="psim-cinema-policy">
            <div className="psim-policy-label">⚖ PHIÊN HỌP CHÍNH SÁCH · QUÝ {quarter}</div>
            <h1 className="psim-cinema-title">Ban hành Nghị quyết Vĩ mô</h1>
            <p className="psim-cinema-desc" style={{ marginBottom: "24px" }}>Chọn 1 đạo luật. Hiệu lực kéo dài đến hết nhiệm kỳ.</p>
            <div className="psim-policy-grid">
              {MACRO_POLICIES.filter(p => !activePolicies.includes(p.id)).map(p => (
                <button key={p.id} className="psim-policy-card" type="button" onClick={() => handlePolicy(p)} onMouseOver={() => SFX.hover()}>
                  <div className="psim-policy-card-head">
                    <span>{p.icon}</span>
                    <strong>{p.title}</strong>
                  </div>
                  <p>{p.desc}</p>
                  <small>{p.effect}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* END SCREEN */}
        {(gameState.startsWith("gameover") || gameState.startsWith("won")) && (
          <div className="psim-cinema-endscreen">
            <EndScreen />
          </div>
        )}

      </div>
    </div>
  );
}
function App() {
  const route = useRoute();
  const [activeTheoryId, setActiveTheoryId] = useState(THEORY_ITEMS[0].id);
  const [modalGroupId, setModalGroupId] = useState(null);
  const [openAccordions, setOpenAccordions] = useState([SOLUTION_ITEMS[0].id]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(NAV_ITEMS[0].id);

  const activeTheory = useMemo(
    () => THEORY_ITEMS.find((item) => item.id === activeTheoryId) || THEORY_ITEMS[0],
    [activeTheoryId]
  );

  const modalGroup = useMemo(
    () => GROUP_ITEMS.find((item) => item.id === modalGroupId) || null,
    [modalGroupId]
  );

  const quizStats = useMemo(() => {
    const answers = Object.values(quizAnswers);
    const good = answers.filter((item) => item.result === "good").length;
    const mixed = answers.filter((item) => item.result === "mixed").length;
    return { good, mixed, answered: answers.length };
  }, [quizAnswers]);

  useEffect(() => {
    if (route !== "home") {
      return undefined;
    }

    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const percent = total > 0 ? (window.scrollY / total) * 100 : 0;
      const nextProgress = Math.min(Math.max(percent, 0), 100);
      setScrollProgress((prev) => (Math.abs(prev - nextProgress) > 0.2 ? nextProgress : prev));

      const offset = window.scrollY + 180;
      let current = NAV_ITEMS[0].id;

      NAV_ITEMS.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section && offset >= section.offsetTop) {
          current = item.id;
        }
      });

      setActiveSection((prev) => (prev === current ? prev : current));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [route]);

  useEffect(() => {
    if (route !== "home") {
      return undefined;
    }

    const revealElements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [route]);

  useEffect(() => {
    if (!modalGroupId) {
      return undefined;
    }

    const onEsc = (event) => {
      if (event.key === "Escape") {
        setModalGroupId(null);
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalGroupId]);

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const chooseOption = (scenarioId, optionKey, result) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [scenarioId]: { optionKey, result }
    }));
  };

  if (route === "game") {
    return <PolicySimGame />;
  }

  return (
    <>
      <div className="progress-wrap" aria-hidden="true">
        <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      <header className="site-nav">
        <div className="nav-inner">
          <div className="brand">
            <span className="brand-badge">VN</span>
            <span>Kinh tế công và điều tiết</span>
          </div>
          <nav className="nav-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link ${activeSection === item.id ? "active" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="hero">
          <div className="hero-grid">
            <div className="hero-copy" data-reveal="">
              <p className="kicker">MLN122 · Chuyên đề nhóm 4 · Chương 4</p>
              <h1 className="hero-title">
                Tập đoàn kinh tế nhà nước tại Việt Nam:
                <span className="hero-title-alt"> độc quyền tự nhiên</span>
                <span className="hero-divider"> </span>
                <span className="hero-title-alt strike"> hay công cụ điều tiết vĩ mô?</span>
              </h1>
              <p className="hero-lede">
                Một góc đọc từ lý luận của V.I.Lênin về độc quyền và độc quyền nhà nước, đặt cạnh thực tiễn EVN,
                PVN và hạ tầng viễn thông trong nền kinh tế thị trường định hướng XHCN.
              </p>
              <div className="hero-actions">
                <a href="#lyluan" className="btn-primary">
                  Bắt đầu chuyên đề
                </a>
                <a href="#/game" className="btn-ghost">
                  Mở mini-game mô phỏng
                </a>
              </div>

              <ul className="hero-stats" aria-label="Số liệu khái quát">
                {HERO_STATS.map((item) => (
                  <li key={item.label}>
                    <p className="hs-value">{item.value}</p>
                    <p className="hs-label">{item.label}</p>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="hero-aside" data-reveal="" aria-hidden="true">
              <div className="aside-card">
                <span className="aside-chip">Lênin · 5 đặc điểm</span>
                <ol className="aside-list">
                  <li>Tập trung sản xuất và độc quyền</li>
                  <li>Tư bản tài chính &amp; tài phiệt</li>
                  <li>Xuất khẩu tư bản</li>
                  <li>Liên minh độc quyền quốc tế</li>
                  <li>Phân chia lãnh thổ kinh tế</li>
                </ol>
                <p className="aside-note">
                  Trong điều kiện hiện nay, những đặc điểm này xuất hiện dưới hình thái mới: chuỗi cung ứng
                  toàn cầu, nền tảng số và độc quyền dữ liệu.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...MARQUEE_TOKENS, ...MARQUEE_TOKENS].map((token, idx) => (
              <span key={`${token}-${idx}`} className="marquee-item">
                <span className="marquee-dot" /> {token}
              </span>
            ))}
          </div>
        </div>

        <section id="lyluan">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Nền tảng lý thuyết</p>
              <h2 className="section-title">
                Vì sao mô hình tập đoàn nhà nước từng là lựa chọn chiến lược?
              </h2>
              <p className="section-sub">
                Nhấn từng luận điểm để xem diễn giải ngắn gọn và ví dụ cụ thể tại Việt Nam. Nội dung bám sát
                Chương 4 — Giáo trình Kinh tế Chính trị Mác — Lênin.
              </p>
            </div>

            <div className="theory-grid">
              <div className="theory-cards" data-reveal="">
                {THEORY_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`theory-card ${activeTheoryId === item.id ? "active" : ""}`}
                    onClick={() => setActiveTheoryId(item.id)}
                  >
                    <div className="theory-icon">{item.index}</div>
                    <h3>{item.cardTitle}</h3>
                    <p>{item.cardSummary}</p>
                  </button>
                ))}
              </div>

              <article className="theory-panel" data-reveal="">
                <img src={activeTheory.image} alt={activeTheory.alt} />
                <div className="theory-content">
                  <h4>{activeTheory.detailTitle}</h4>
                  <p>{activeTheory.detailText}</p>
                  <p className="callout">{activeTheory.example}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="reality" id="thuctrang">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Thực trạng vận hành</p>
              <h2 className="section-title">Ba trụ cột đang nắm hạ tầng thiết yếu</h2>
              <p className="section-sub">
                Nhấn từng thẻ để mở phân tích vai trò kinh tế, tính độc quyền tự nhiên và tình huống điển hình.
              </p>
            </div>

            <div className="reality-grid">
              {GROUP_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className="group-card"
                  role="button"
                  tabIndex={0}
                  data-reveal=""
                  onClick={() => setModalGroupId(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setModalGroupId(item.id);
                    }
                  }}
                >
                  <div className="group-thumb">
                    <span className="pill">{item.sector}</span>
                    <img src={item.image} alt={item.alt} />
                  </div>
                  <div className="group-body">
                    <h3>{item.name}</h3>
                    <p className="group-full">{item.fullName}</p>
                    <p>{item.summary}</p>
                    <span className="group-more">Xem chi tiết →</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="phantich">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Hai chiều phân tích</p>
              <h2 className="section-title">
                Công cụ điều tiết vĩ mô hay nguy cơ độc quyền kéo dài?
              </h2>
              <p className="section-sub">
                Một góc nhìn cân bằng giữa mục tiêu ổn định xã hội và hiệu quả thị trường.
              </p>
            </div>

            <div className="analysis-wrap">
              <article className="analysis-col" data-reveal="">
                <div className="analysis-image">
                  <img
                    src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80"
                    alt="Điện khí đến khu vực nông thôn và phát triển hạ tầng công cộng"
                  />
                </div>
                <div className="analysis-content">
                  <h3>Vai trò tích cực trong điều tiết</h3>
                  <ul>
                    <li>
                      <span className="dot plus">+</span>
                      <span>Giảm sốc giá đầu vào trong giai đoạn lạm phát và biến động quốc tế.</span>
                    </li>
                    <li>
                      <span className="dot plus">+</span>
                      <span>
                        Bảo đảm dịch vụ công ích ở khu vực lợi nhuận thấp nhưng nhu cầu xã hội cao.
                      </span>
                    </li>
                    <li>
                      <span className="dot plus">+</span>
                      <span>Tạo năng lực triển khai nhanh các dự án hạ tầng chiến lược quy mô lớn.</span>
                    </li>
                    <li>
                      <span className="dot plus">+</span>
                      <span>Hỗ trợ mục tiêu an ninh năng lượng và tự chủ kinh tế dài hạn.</span>
                    </li>
                  </ul>
                </div>
              </article>

              <article className="analysis-col" data-reveal="">
                <div className="analysis-image">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
                    alt="Không gian đô thị công nghiệp phản ánh áp lực hiệu quả và cạnh tranh"
                  />
                </div>
                <div className="analysis-content">
                  <h3>Rủi ro của cấu trúc độc quyền</h3>
                  <ul>
                    <li>
                      <span className="dot minus">−</span>
                      <span>Động lực cải tiến suy giảm khi cạnh tranh bị giới hạn.</span>
                    </li>
                    <li>
                      <span className="dot minus">−</span>
                      <span>Chi phí quản trị cao dễ chuyển hóa thành gánh nặng giá và ngân sách.</span>
                    </li>
                    <li>
                      <span className="dot minus">−</span>
                      <span>Quy trình ra quyết định chậm, kém linh hoạt trước công nghệ mới.</span>
                    </li>
                    <li>
                      <span className="dot minus">−</span>
                      <span>
                        Nguy cơ xung đột giữa mục tiêu chính sách và mục tiêu hiệu quả doanh nghiệp.
                      </span>
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="giaiphap">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Lộ trình cải cách</p>
              <h2 className="section-title">
                Ba hướng thiết kế thể chế để dung hòa ổn định và cạnh tranh
              </h2>
              <p className="section-sub">Mở từng mục để xem lợi ích kỳ vọng và hàm ý chính sách.</p>
            </div>

            <div className="solution-layout">
              <figure className="solution-image" data-reveal="">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80"
                  alt="Bối cảnh hoạch định chính sách và cải cách thể chế kinh tế"
                />
                <figcaption className="solution-note">
                  Cải cách hiệu quả không chỉ là bán vốn, mà là thiết kế lại cơ chế giám sát, động lực và
                  trách nhiệm giải trình.
                </figcaption>
              </figure>

              <div className="accordion" data-reveal="">
                {SOLUTION_ITEMS.map((item) => {
                  const isOpen = openAccordions.includes(item.id);
                  return (
                    <article key={item.id} className={`acc-item ${isOpen ? "open" : ""}`}>
                      <button className="acc-head" type="button" onClick={() => toggleAccordion(item.id)}>
                        <h4>{item.title}</h4>
                        <span className="acc-icon">+</span>
                      </button>
                      {isOpen && (
                        <div className="acc-body">
                          {item.explanation}
                          <br />
                          <span className="benefit">{item.benefit}</span>
                          <br />
                          {item.implication}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="game-teaser" id="game">
          <div className="container">
            <div className="teaser-card" data-reveal="">
              <div className="teaser-left">
                <p className="section-tag light">Trải nghiệm tương tác</p>
                <h2 className="teaser-title">
                  Bước vào ghế điều hành — và thử cân bằng ba mục tiêu trong 12 quý.
                </h2>
                <p className="teaser-sub">
                  Một mini-game mô phỏng đang được phát triển: bạn đóng vai người hoạch định chính sách của
                  một tập đoàn nhà nước, điều chỉnh giá, đầu tư, trợ cấp trước các cú sốc vĩ mô.
                </p>
                <div className="teaser-actions">
                  <a href="#/game" className="btn-primary">
                    Vào trang chờ mini-game
                  </a>
                  <span className="teaser-chip">Engine đang phát triển · nhóm kỹ thuật</span>
                </div>
              </div>
              <div className="teaser-visual" aria-hidden="true">
                <div className="tv-grid">
                  <div className="tv-tile">
                    <p className="tv-label">CPI</p>
                    <p className="tv-value">3.8%</p>
                    <div className="tv-bar"><span style={{ width: "62%" }} /></div>
                  </div>
                  <div className="tv-tile tv-dark">
                    <p className="tv-label">Độ phủ</p>
                    <p className="tv-value">94%</p>
                    <div className="tv-bar"><span style={{ width: "88%" }} /></div>
                  </div>
                  <div className="tv-tile">
                    <p className="tv-label">ROIC</p>
                    <p className="tv-value">5.1%</p>
                    <div className="tv-bar"><span style={{ width: "45%" }} /></div>
                  </div>
                  <div className="tv-tile tv-accent">
                    <p className="tv-label">Quý</p>
                    <p className="tv-value">07 / 12</p>
                    <div className="tv-bar"><span style={{ width: "58%" }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="quiz">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Tranh luận lớp học</p>
              <h2 className="section-title">Bạn sẽ chọn chính sách nào?</h2>
              <p className="section-sub">
                Mỗi lựa chọn đều có đánh đổi. Bấm A hoặc B để xem phản hồi và thảo luận ngay trên lớp.
              </p>
            </div>

            <div className="quiz-wrap">
              {SCENARIOS.map((scenario) => {
                const answer = quizAnswers[scenario.id];

                return (
                  <article className="scenario" data-reveal="" key={scenario.id}>
                    <h4>{scenario.title}</h4>
                    <p>{scenario.description}</p>
                    <div className="choice-row">
                      {scenario.options.map((option) => (
                        <button
                          key={option.key}
                          className={`choice ${answer?.optionKey === option.key ? "selected" : ""}`}
                          type="button"
                          onClick={() => chooseOption(scenario.id, option.key, option.result)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div
                      className={`scenario-result ${answer ? "show" : ""} ${answer?.result === "good" ? "good" : ""
                        }`}
                    >
                      {answer ? QUIZ_FEEDBACK[answer.result] : ""}
                    </div>
                  </article>
                );
              })}

              <div className="stats" data-reveal="">
                <div className="stat">
                  <p className="stat-value">{quizStats.good}</p>
                  <p className="stat-label">Lựa chọn cân bằng</p>
                </div>
                <div className="stat">
                  <p className="stat-value">{quizStats.mixed}</p>
                  <p className="stat-label">Lựa chọn cần đánh đổi</p>
                </div>
                <div className="stat">
                  <p className="stat-value">{quizStats.answered}</p>
                  <p className="stat-label">Tình huống đã trả lời</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="research" id="nghiencuu">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Đọc thêm · Tài liệu tham khảo</p>
              <h2 className="section-title">Nguồn tra cứu cho phần trình bày và phản biện</h2>
              <p className="section-sub">
                Các liên kết dẫn tới tài liệu gốc, văn bản chính sách và dữ liệu vận hành của tập đoàn. Nhớ
                kiểm tra ngày cập nhật khi trích dẫn trong bài viết.
              </p>
            </div>

            <div className="research-grid" data-reveal="">
              {RESEARCH_LINKS.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="research-card"
                >
                  <div className="research-top">
                    <span className="research-chip">{item.label}</span>
                    <span className="research-arrow">↗</span>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <span className="research-source">{item.source}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="conclusion" id="ketluan">
          <div className="container">
            <div className="conclusion-box" data-reveal="">
              <div className="conclusion-media">
                <img
                  src="https://img4.thuthuatphanmem.vn/uploads/2020/01/10/hinh-anh-cay-tre-xanh-nhin-tu-phia-duoi_053455576.jpg"
                  alt="Hình tượng tre Việt Nam, biểu trưng cho cân bằng giữa gốc rễ và độ linh hoạt"
                  loading="lazy"
                />
              </div>
              <div className="conclusion-text">
                <p className="section-tag">Kết luận</p>
                <h3>
                  Giống như cây tre: <span className="highlight">rễ phải chắc</span>, nhưng{" "}
                  <span className="highlight">cành phải linh hoạt</span>.
                </h3>
                <p>
                  Trong cấu trúc kinh tế hiện đại, Nhà nước nên giữ vai trò nền tảng ở các mắt xích độc
                  quyền tự nhiên, đồng thời mở không gian cạnh tranh ở khâu có thể thị trường hóa.
                </p>
                <p>
                  Không cực đoan theo một phía — trọng tâm là thiết kế thể chế đủ minh bạch để vừa ổn định
                  vĩ mô, vừa khuyến khích hiệu quả dài hạn.
                </p>
                <p className="conclusion-meta">
                  Nhóm 4 · MLN122 · Chuyên đề Chương 4 — Cạnh tranh và độc quyền trong nền kinh tế thị trường.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        Bản trình bày tương tác cho thảo luận lớp học · Tập đoàn kinh tế nhà nước và bài toán điều tiết vĩ mô
        tại Việt Nam · Nhóm 4 MLN122.
      </footer>

      <div
        className={`modal ${modalGroup ? "open" : ""}`}
        aria-hidden={modalGroup ? "false" : "true"}
        role="dialog"
        aria-modal="true"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setModalGroupId(null);
          }
        }}
      >
        {modalGroup && (
          <article className="modal-card">
            <button
              className="modal-close"
              type="button"
              aria-label="Đóng"
              onClick={() => setModalGroupId(null)}
            >
              ×
            </button>
            <div className="modal-header">
              <img src={modalGroup.image} alt={modalGroup.alt} />
              <div className="modal-header-text">
                <span className="pill">{modalGroup.sector}</span>
                <h4 className="modal-title">{`${modalGroup.name} — ${modalGroup.fullName}`}</h4>
              </div>
            </div>
            <div className="modal-body">
              <div>
                <h5>Vai trò chính</h5>
                <p>{modalGroup.role}</p>
              </div>
              <div>
                <h5>Yếu tố độc quyền tự nhiên</h5>
                <p>{modalGroup.monopoly}</p>
              </div>
              <div>
                <h5>Tính hai mặt</h5>
                <p>{modalGroup.twoSide}</p>
              </div>
              <div>
                <h5>Tình huống điển hình</h5>
                <p>{modalGroup.example}</p>
              </div>
            </div>
          </article>
        )}
      </div>
    </>
  );
}

export default App;
