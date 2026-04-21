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
  { id: "thuctrang", label: "Đối chiếu" },
  { id: "phantich", label: "Hai mặt" },
  { id: "giaiphap", label: "Giải pháp" },
  { id: "game", label: "Mini-game" },
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
    id: "hinh-thanh",
    index: "01",
    cardTitle: "Sự hình thành độc quyền",
    cardSummary:
      "Tự do cạnh tranh → tích tụ, tập trung sản xuất → độc quyền. Độc quyền nhà nước là sự kết hợp tổ chức độc quyền với sức mạnh nhà nước.",
    detailTitle: "Lênin: độc quyền sinh ra từ chính tự do cạnh tranh",
    detailText:
      "Khi lực lượng sản xuất phát triển đến ngưỡng nhất định, tích tụ và tập trung tư bản tất yếu đẩy thị trường sang giai đoạn độc quyền. Độc quyền nhà nước — theo Lênin — là sự kết hợp sức mạnh của các tổ chức độc quyền với sức mạnh của bộ máy nhà nước. Trong CNTB, nó nhằm bảo vệ lợi ích độc quyền tư nhân và cứu nguy cho chủ nghĩa tư bản.",
    example:
      "Đối chiếu Việt Nam: mô hình tập đoàn nhà nước hiện nay KHÔNG mang bản chất đó — nó là công cụ vật chất của Nhà nước pháp quyền XHCN, không nhằm bảo vệ lợi ích tư nhân độc quyền.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1400&q=80",
    alt: "Hạ tầng công nghiệp quy mô lớn"
  },
  {
    id: "tu-nhien",
    index: "02",
    cardTitle: "Độc quyền tự nhiên",
    cardSummary:
      "Một doanh nghiệp duy nhất cung ứng toàn thị trường với chi phí trung bình thấp hơn nhiều doanh nghiệp cộng lại.",
    detailTitle: "Khi nhân bản hạ tầng là lãng phí nguồn lực",
    detailText:
      "Độc quyền tự nhiên xuất hiện ở các ngành có chi phí cố định rất lớn và hiệu ứng quy mô mạnh: truyền tải điện, mạng ống nước, cáp trục quốc gia, đường sắt. Không thể có hai hệ thống cột điện, hai ống dẫn khí chạy song song mà vẫn hiệu quả — nên một nhà vận hành duy nhất là lời giải rẻ nhất cho xã hội.",
    example:
      "Ví dụ Việt Nam: lưới truyền tải 500 kV Bắc — Nam, mạng cáp quang biển, ống dẫn khí Nam Côn Sơn — tất cả đều là độc quyền tự nhiên điển hình.",
    image:
      "https://images.unsplash.com/photo-1518183214770-9cffbec72538?auto=format&fit=crop&w=1400&q=80",
    alt: "Phát triển hạ tầng quốc gia"
  },
  {
    id: "ban-chat-vn",
    index: "03",
    cardTitle: "Bản chất khác biệt ở Việt Nam",
    cardSummary:
      "Tập đoàn nhà nước không phải độc quyền tư bản — mà là công cụ nắm huyết mạch, bảo đảm an ninh quốc gia và an sinh xã hội.",
    detailTitle: "Không tối đa hóa lợi nhuận — mà phục vụ ba mục tiêu",
    detailText:
      "Khác với độc quyền tư bản tư nhân, tập đoàn kinh tế nhà nước Việt Nam (EVN, PVN, Viettel, VNPT, MobiFone…) được thiết kế để: (1) nắm giữ các huyết mạch của nền kinh tế; (2) bảo đảm an ninh quốc gia — năng lượng, thông tin, lương thực; (3) thực hiện chính sách an sinh xã hội mà tư nhân không sẵn lòng làm vì biên lợi nhuận thấp.",
    example:
      "Thực trạng: EVN vẫn độc quyền tự nhiên ở khâu truyền tải, nhưng khâu phát điện đã mở cạnh tranh. Viễn thông đã chuyển sang độc quyền nhóm cạnh tranh gay gắt — người dùng hưởng lợi rõ rệt về giá và dịch vụ.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    alt: "Không gian hoạch định chính sách"
  }
];

const GROUP_ITEMS = [
  {
    id: "evn",
    sector: "Độc quyền tự nhiên",
    name: "EVN",
    fullName: "Tập đoàn Điện lực Việt Nam",
    summary:
      "Độc quyền tự nhiên ở khâu truyền tải — nhưng khâu phát điện đã mở cạnh tranh.",
    role:
      "EVN vận hành lưới truyền tải cao thế, điều độ hệ thống quốc gia (A0) và phân phối điện. Ở khâu phát điện, Việt Nam đã mở cho nhà máy tư nhân, BOT, FDI tham gia — đang từng bước tiến tới thị trường phát điện cạnh tranh.",
    monopoly:
      "Lưới truyền tải 500 kV / 220 kV là độc quyền tự nhiên điển hình: không thể mỗi công ty xây một hệ thống cột điện riêng — chi phí xã hội sẽ cực kỳ lãng phí. Một nhà vận hành duy nhất là lời giải hiệu quả nhất.",
    twoSide:
      "Tích cực: điện khí hóa nông thôn >99% hộ, trợ giá bậc thang cho hộ nghèo, bình ổn giá khi thế giới biến động. Rủi ro: thiếu cạnh tranh ở bán lẻ, giá điện khó phản ánh đúng chi phí đầu vào, dễ bị xem là độc quyền áp đặt.",
    example:
      "Thiếu điện cục bộ miền Bắc mùa hè 2023 cho thấy sức ép tách bạch điều độ — phát — phân phối và đẩy nhanh thị trường bán lẻ điện cạnh tranh.",
    image:
      "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=1300&q=80",
    alt: "Lưới điện cao thế và trạm biến áp"
  },
  {
    id: "pvn",
    sector: "Độc quyền nhà nước",
    name: "PVN",
    fullName: "Tập đoàn Dầu khí Việt Nam",
    summary:
      "Độc quyền nhà nước trong khai thác tài nguyên để bảo vệ chủ quyền và lợi ích quốc gia.",
    role:
      "PVN hoạt động xuyên suốt thăm dò — khai thác — vận chuyển khí — chế biến — phân phối. Hoạt động ngoài khơi gắn liền với chủ quyền biển đảo. Nhiều năm đóng góp 9–11% thu ngân sách nhà nước.",
    monopoly:
      "Đây là độc quyền nhà nước có chủ đích: tài nguyên dầu khí thuộc sở hữu toàn dân, hoạt động thượng nguồn gắn với an ninh biển đảo và rủi ro địa chính trị — không thể giao hoàn toàn cho tư nhân.",
    twoSide:
      "Tích cực: chuỗi khí — điện — đạm tạo liên kết công nghiệp, đảm bảo an ninh năng lượng. Rủi ro: biến động giá dầu thế giới; đầu tư ngoài ngành (ngân hàng, bất động sản) trước đây từng gây thất thoát vốn.",
    example:
      "Cụm dự án Nhơn Trạch 3 & 4 dùng khí LNG là bài kiểm tra năng lực chuyển dịch năng lượng theo cam kết Net Zero 2050.",
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1300&q=80",
    alt: "Giàn khoan ngoài khơi và công nghiệp lọc hóa dầu"
  },
  {
    id: "vnpt",
    sector: "Độc quyền nhóm có cạnh tranh",
    name: "Viettel / VNPT / MobiFone",
    fullName: "Hạ tầng viễn thông quốc gia",
    summary:
      "Từng là độc quyền — nay là Oligopoly cạnh tranh gay gắt, mang lợi ích rõ rệt cho người dùng.",
    role:
      "Ba nhà mạng nhà nước cùng cung cấp di động, băng rộng, nền tảng số công. Khác với điện — dầu khí, viễn thông đã mở cạnh tranh rộng ở bán lẻ, giá cước Việt Nam thuộc nhóm thấp của khu vực.",
    monopoly:
      "Chỉ một số lớp hạ tầng lõi (truyền dẫn trục, cáp quang biển, data center cấp quốc gia) vẫn mang yếu tố độc quyền tự nhiên. Phần còn lại là cạnh tranh thực chất.",
    twoSide:
      "Tích cực: phổ cập băng rộng, chính quyền số, y tế — giáo dục từ xa; người dùng hưởng giá rẻ và dịch vụ liên tục cải thiện. Rủi ro: nếu thiếu điều tiết dữ liệu, có thể xuất hiện độc quyền dữ liệu và bất đối xứng thông tin.",
    example:
      "Chuyển từ nhà mạng sang nền tảng công nghệ số: 5G, cloud nội địa, hệ sinh thái Mobile Money là phép thử tiếp theo.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1300&q=80",
    alt: "Hạ tầng viễn thông, cáp quang và mạng số"
  }
];

const SOLUTION_ITEMS = [
  {
    id: "tach-quan-ly",
    title: "01 · Tách bạch \"Quản lý nhà nước\" và \"Đại diện chủ sở hữu vốn\"",
    explanation:
      "Đẩy mạnh vai trò của Ủy ban Quản lý vốn nhà nước tại doanh nghiệp (\"Siêu ủy ban\"). DNNN phải hoạt động như một công ty thực thụ trên thương trường, tự chủ lỗ lãi. Nhà nước không can thiệp vào điều hành hàng ngày.",
    benefit: "Kỳ vọng: chấm dứt tình trạng \"vừa đá bóng vừa thổi còi\", tăng trách nhiệm giải trình.",
    implication:
      "Hàm ý: cơ quan ban hành chính sách, cơ quan giám sát cạnh tranh và cơ quan đại diện vốn phải là ba chủ thể tách biệt."
  },
  {
    id: "co-phan-hoa",
    title: "02 · Đẩy mạnh cổ phần hóa và thoái vốn có chọn lọc",
    explanation:
      "Nhà nước chỉ giữ 100% vốn ở lĩnh vực cốt lõi: an ninh, quốc phòng, truyền tải điện, hạ tầng trọng yếu. Các khâu khác — bán lẻ điện, khai thác thương mại, dịch vụ số — cần gọi vốn tư nhân để tăng cạnh tranh.",
    benefit: "Kỳ vọng: kỷ luật tài chính, minh bạch, áp lực hiệu quả từ cổ đông.",
    implication:
      "Hàm ý: xác định rõ danh mục lĩnh vực Nhà nước chi phối tuyệt đối trong Luật Quản lý, sử dụng vốn nhà nước sửa đổi."
  },
  {
    id: "xoa-doc-quyen",
    title: "03 · Xóa bỏ độc quyền doanh nghiệp — chỉ giữ độc quyền nhà nước khi thật sự cần",
    explanation:
      "Thúc đẩy hoàn thiện Thị trường bán lẻ điện cạnh tranh. Tách EVN khỏi các nhà máy phát điện: các nhà máy (tư nhân, nước ngoài, nhà nước) cạnh tranh bán điện; EVN chỉ thu phí \"thuê đường dây truyền tải\".",
    benefit: "Kỳ vọng: giảm chi phí dài hạn, khuyến khích đổi mới công nghệ, minh bạch giá điện.",
    implication:
      "Hàm ý: lộ trình giá thị trường đi kèm gói hỗ trợ nhóm yếu thế để tránh sốc giá lên hộ thu nhập thấp."
  },
  {
    id: "quan-tri-oecd",
    title: "04 · Áp dụng quản trị doanh nghiệp hiện đại (chuẩn OECD)",
    explanation:
      "Minh bạch hóa tài chính, kiểm toán độc lập quốc tế. Thuê các CEO và chuyên gia giỏi từ bên ngoài (kể cả người nước ngoài) vào điều hành — thay vì chỉ bổ nhiệm cán bộ theo tư duy hành chính.",
    benefit: "Kỳ vọng: năng lực quản trị ngang tầm khu vực, giảm rủi ro đầu tư ngoài ngành.",
    implication:
      "Hàm ý: công bố thông tin theo chuẩn công ty niêm yết, KPI hiệu quả vốn nhà nước rõ ràng, đánh giá độc lập định kỳ."
  }
];

const RESEARCH_LINKS = [
  {
    label: "Văn kiện Đảng",
    title: "Nghị quyết 12-NQ/TW (03/6/2017) — Cơ cấu lại, đổi mới DNNN",
    description:
      "Toàn văn nghị quyết Hội nghị Trung ương 5 khóa XII: quan điểm chỉ đạo, mục tiêu, nhiệm vụ và giải pháp cải cách doanh nghiệp nhà nước.",
    href: "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-cua-dang/nghi-quyet-so-12-nqtw-ngay-362017-hoi-nghi-lan-thu-nam-ban-chap-hanh-trung-uong-dang-khoa-xii-ve-tiep-tuc-co-cau-lai-3223",
    source: "tulieuvankien.dangcongsan.vn"
  },
  {
    label: "Học thuật",
    title: "Tạp chí Cộng sản — DNNN phát huy vai trò mở đường, dẫn dắt",
    description:
      "Bài phân tích giải pháp để doanh nghiệp nhà nước giữ vai trò mở đường, dẫn dắt trong phát triển kinh tế — xã hội theo tinh thần nghị quyết.",
    href: "https://www.tapchicongsan.org.vn/en/media-story/-/asset_publisher/V8hhp4dK31Gf/content/giai-phap-thuc-day-doanh-nghiep-nha-nuoc-phat-huy-vai-tro-mo-duong-dan-dat-trong-phat-trien-kinh-te-xa-hoi",
    source: "tapchicongsan.org.vn"
  },
  {
    label: "Lý luận",
    title: "Tạp chí Quản lý nhà nước — Vai trò điều tiết của Nhà nước (10/2025)",
    description:
      "Phát huy vai trò điều tiết của Nhà nước trong nền kinh tế thị trường định hướng XHCN: hàm ý chính sách cho khu vực DNNN hiện nay.",
    href: "https://www.quanlynhanuoc.vn/2025/10/16/phat-huy-vai-tro-dieu-tiet-cua-nha-nuoc-trong-nen-kinh-te-thi-truong-dinh-huong-xa-hoi-chu-nghia-o-viet-nam-hien-nay/",
    source: "quanlynhanuoc.vn"
  },
  {
    label: "Nghiên cứu",
    title: "Tạp chí Quản lý nhà nước — Đổi mới DNNN (03/2025)",
    description:
      "Đổi mới doanh nghiệp nhà nước trong nền kinh tế thị trường định hướng XHCN ở Việt Nam: đánh giá thực trạng và kiến nghị giải pháp.",
    href: "https://www.quanlynhanuoc.vn/2025/03/01/doi-moi-doanh-nghiep-nha-nuoc-trong-nen-kinh-te-thi-truong-dinh-huong-xa-hoi-chu-nghia-o-viet-nam/",
    source: "quanlynhanuoc.vn"
  },
  {
    label: "Dữ liệu — EVN",
    title: "EVN — Báo cáo tổng kết thực hiện kế hoạch 2023 (PDF)",
    description:
      "Sản lượng điện 253,05 tỷ kWh (+4,26%), doanh thu bán điện 494.359 tỷ đồng, kết quả kinh doanh điện lỗ 21.821 tỷ đồng — số liệu chính thức.",
    href: "https://www.evn.com.vn/userfile/User/minhhanh/files/2024/6/BaocaoTongketEVN2023.pdf",
    source: "evn.com.vn (PDF)"
  },
  {
    label: "Dữ liệu — PVN",
    title: "Petrovietnam — Kho báo cáo thường niên (toàn giai đoạn)",
    description:
      "Trang tổng hợp các báo cáo thường niên của Tập đoàn Công nghiệp — Năng lượng Quốc gia Việt Nam: đóng góp ngân sách, sản lượng khai thác, chiến lược chuyển dịch.",
    href: "https://www.pvn.vn/Pages/baocaothuongnien.aspx?catid=D85EBBC6-4BB6-4111-B500-0EFA472B64EB",
    source: "pvn.vn"
  },
  {
    label: "Quốc tế",
    title: "World Bank — Reform of State-Owned Enterprises in Viet Nam (PDF)",
    description:
      "Báo cáo chuyên đề về cải cách DNNN Việt Nam: minh bạch, hiệu quả vốn, khuyến nghị quản trị theo chuẩn OECD và lộ trình cổ phần hóa.",
    href: "https://state-owned-enterprises.worldbank.org/sites/soe/files/reports/REFORM%20OF%20STATE-OWNED%20ENTERPRISES%20IN%20VIET%20NAM%20TO%20INCREASE%20PERFORMANCE%20AND%20PROFIT.pdf",
    source: "worldbank.org (PDF)"
  },
  {
    label: "Thực tiễn",
    title: "Tuổi Trẻ — \"Dân vẫn chưa được chọn nhà bán lẻ điện\" (09/2025)",
    description:
      "Bài báo cập nhật lộ trình thị trường bán lẻ điện cạnh tranh, vì sao EVN vẫn là đơn vị duy nhất và các vướng mắc ở khâu tách bạch phát — truyền tải — bán lẻ.",
    href: "https://tuoitre.vn/dan-van-chua-duoc-chon-nha-ban-le-dien-2025090821471906.htm",
    source: "tuoitre.vn"
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
              <p className="section-tag">Phần 1 · Lý luận</p>
              <h2 className="section-title">
                Từ lý luận Lênin về độc quyền đến đặc thù Việt Nam
              </h2>
              <p className="section-sub">
                Ba lát cắt lý luận dùng cho phần đối chiếu: sự hình thành độc quyền, độc quyền tự nhiên,
                và bản chất khác biệt của tập đoàn kinh tế nhà nước XHCN. Nhấn từng thẻ để mở diễn giải.
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
              <p className="section-tag">Phần 1 · Đối chiếu thực tiễn</p>
              <h2 className="section-title">EVN, PVN, Viễn thông — ba lát cắt điển hình</h2>
              <p className="section-sub">
                Áp lý luận vào thực tiễn: đâu là độc quyền tự nhiên, đâu đã chuyển sang độc quyền nhóm
                cạnh tranh, đâu là độc quyền nhà nước vì an ninh quốc gia. Nhấn thẻ để xem phân tích chi tiết.
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
              <p className="section-tag">Phần 2 · Tính hai mặt</p>
              <h2 className="section-title">
                Công cụ điều tiết vĩ mô — đi kèm nguy cơ kém hiệu quả
              </h2>
              <p className="section-sub">
                Nhìn qua lăng kính biện chứng: ba giá trị tích cực đặt cạnh ba rủi ro thường gặp
                của mô hình tập đoàn kinh tế nhà nước ở Việt Nam.
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
                  <h3>Mặt tích cực — điều tiết & hàng hóa công</h3>
                  <ul>
                    <li>
                      <span className="dot plus">+</span>
                      <span>
                        <strong>Ổn định kinh tế vĩ mô:</strong> EVN, Petrolimex "gánh lỗ" giữ giá điện
                        — xăng khi giá than — dầu thế giới tăng phi mã (2022), kiểm soát lạm phát —
                        điều mà doanh nghiệp tư nhân đặt lợi nhuận lên đầu sẽ không làm.
                      </span>
                    </li>
                    <li>
                      <span className="dot plus">+</span>
                      <span>
                        <strong>Hàng hóa công & an sinh:</strong> EVN kéo điện ra Trường Sa, Phú Quốc;
                        Viettel phủ sóng vùng núi cao — chi phí khổng lồ, thu hồi vốn rất lâu, tư nhân
                        không muốn làm. Không ai bị bỏ lại phía sau.
                      </span>
                    </li>
                    <li>
                      <span className="dot plus">+</span>
                      <span>
                        <strong>Mở đường & dẫn dắt:</strong> đầu tư công nghiệp nặng và hạ tầng cốt lõi
                        đòi vốn cực lớn, rủi ro cao — nhà nước đi trước để tạo nền cho khối tư nhân
                        phát triển theo.
                      </span>
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
                  <h3>Mặt tiêu cực — nguy cơ độc quyền & kém hiệu quả</h3>
                  <ul>
                    <li>
                      <span className="dot minus">−</span>
                      <span>
                        <strong>Trì trệ, thiếu động lực đổi mới:</strong> khi không sợ phá sản, không
                        sợ mất thị phần, doanh nghiệp dễ rơi vào sức ì — chậm cải tiến công nghệ và
                        dịch vụ khách hàng.
                      </span>
                    </li>
                    <li>
                      <span className="dot minus">−</span>
                      <span>
                        <strong>Kém hiệu quả phân bổ nguồn lực:</strong> bộ máy cồng kềnh, quan liêu.
                        Từng có giai đoạn đầu tư ngoài ngành dàn trải (điện — dầu khí đi làm ngân hàng,
                        bất động sản) dẫn đến thất thoát vốn nhà nước.
                      </span>
                    </li>
                    <li>
                      <span className="dot minus">−</span>
                      <span>
                        <strong>Rủi ro giá & bất đối xứng thông tin:</strong> người tiêu dùng đôi khi
                        phải chịu mức giá do thế độc quyền áp đặt, cơ chế tính giá chưa minh bạch,
                        thiếu lựa chọn thay thế — điện sinh hoạt là ví dụ rõ nhất.
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
              <p className="section-tag">Phần 3 · Giải pháp</p>
              <h2 className="section-title">
                Phát huy vai trò chủ đạo — vận hành theo cơ chế thị trường
              </h2>
              <p className="section-sub">
                Bốn nhóm giải pháp để dung hòa bài toán "vừa làm anh cả, vừa phải đá bóng hay như
                tư nhân". Mở từng mục để xem lợi ích kỳ vọng và hàm ý chính sách.
              </p>
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

        <section className="research" id="nghiencuu">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Đọc thêm · Tài liệu tham khảo</p>
              <h2 className="section-title">Nguồn tra cứu bổ sung</h2>
              
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
