import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Mở đầu" },
  { id: "lyluan", label: "Lý luận" },
  { id: "thuctrang", label: "Thực trạng" },
  { id: "phantich", label: "Phân tích" },
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

function GamePlaceholder() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 120), 60);
    return () => clearInterval(id);
  }, []);

  const loadingPercent = 10 + (tick % 90);

  return (
    <main className="game-page">
      <header className="game-nav">
        <a href="#/" className="game-back">
          <span aria-hidden="true">←</span> Quay lại chuyên đề
        </a>
        <div className="game-brand">
          <span className="brand-badge">VN</span>
          <span>Mô phỏng chính sách</span>
        </div>
      </header>

      <section className="game-stage">
        <div className="stage-grid">
          <div className="stage-left">
            <p className="kicker kicker-dark">Mini-game · Coming soon</p>
            <h1 className="stage-title">
              Bạn là nhà <span className="grad">hoạch định chính sách</span> của một tập đoàn nhà nước.
            </h1>
            <p className="stage-sub">
              Trong phiên bản đầy đủ, bạn sẽ điều khiển giá điện, mức đầu tư hạ tầng, và chính sách trợ giá
              trong 12 quý giả lập. Mỗi quyết định ảnh hưởng tới chỉ số CPI, mức độ phủ sóng dịch vụ và lợi
              nhuận tập đoàn.
            </p>

            <div className="stage-meters">
              <div className="meter">
                <div className="meter-head">
                  <span>Biên độ giá điện</span>
                  <span className="meter-num">±{(tick % 10) + 2}%</span>
                </div>
                <div className="meter-track">
                  <span style={{ width: `${30 + (tick % 40)}%` }} />
                </div>
              </div>
              <div className="meter">
                <div className="meter-head">
                  <span>Độ phủ dịch vụ</span>
                  <span className="meter-num">{87 + (tick % 10)}%</span>
                </div>
                <div className="meter-track">
                  <span className="meter-green" style={{ width: `${70 + (tick % 25)}%` }} />
                </div>
              </div>
              <div className="meter">
                <div className="meter-head">
                  <span>Hiệu quả vốn ROIC</span>
                  <span className="meter-num">{(4.2 + (tick % 20) / 10).toFixed(1)}%</span>
                </div>
                <div className="meter-track">
                  <span className="meter-amber" style={{ width: `${40 + (tick % 35)}%` }} />
                </div>
              </div>
            </div>

            <div className="stage-status">
              <div className="status-dot" />
              <span className="status-text">
                Engine đang được phát triển — phần lập trình dành cho nhóm kỹ thuật.
              </span>
            </div>

            <div className="loading-wrap">
              <div className="loading-bar">
                <span style={{ width: `${loadingPercent}%` }} />
              </div>
              <div className="loading-meta">
                <span>Build · internal</span>
                <span>{loadingPercent.toString().padStart(3, "0")} / 100</span>
              </div>
            </div>
          </div>

          <aside className="stage-right" aria-hidden="true">
            <div className="console">
              <div className="console-head">
                <span className="dot-r" />
                <span className="dot-y" />
                <span className="dot-g" />
                <span className="console-title">policy-sim · mln122</span>
              </div>
              <div className="console-body">
                <p>
                  <span className="c-mute">$</span> init scenario --country VN --sector energy
                </p>
                <p>
                  <span className="c-mute">›</span> Loading macro shocks… <span className="c-ok">ok</span>
                </p>
                <p>
                  <span className="c-mute">›</span> Calibrating EVN / PVN / VNPT…{" "}
                  <span className="c-ok">ok</span>
                </p>
                <p>
                  <span className="c-mute">›</span> Binding CPI weight → 0.38{" "}
                  <span className="c-ok">ok</span>
                </p>
                <p>
                  <span className="c-mute">›</span> Waiting for gameplay module…{" "}
                  <span className="c-warn">pending</span>
                  <span className="blink">▌</span>
                </p>
              </div>
            </div>

            <div className="bento">
              <div className="bento-card">
                <p className="bento-label">Tình huống mẫu</p>
                <p className="bento-title">Shock giá dầu Brent +22%</p>
                <p className="bento-sub">Quý 3 / năm mô phỏng</p>
              </div>
              <div className="bento-card dark">
                <p className="bento-label">Mục tiêu vĩ mô</p>
                <p className="bento-title">Giữ CPI &lt; 4.5%</p>
                <p className="bento-sub">Trong 4 quý liên tiếp</p>
              </div>
              <div className="bento-card wide">
                <p className="bento-label">Bảng điểm</p>
                <p className="bento-title">Cân bằng Ổn định — Hiệu quả — Công bằng</p>
                <p className="bento-sub">
                  Kết thúc 12 quý, hệ thống tính điểm theo ba trục như mô hình trilemma kinh tế.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="stage-foot">
          <span>Placeholder của mini-game sẽ được gắn bởi thành viên phụ trách lập trình.</span>
          <a className="btn-primary" href="#/">
            Về trang chuyên đề
          </a>
        </footer>
      </section>
    </main>
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
    return <GamePlaceholder />;
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
