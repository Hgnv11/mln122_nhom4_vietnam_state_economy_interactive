import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Mở đầu" },
  { id: "lyluan", label: "Lý luận" },
  { id: "thuctrang", label: "Thực trạng" },
  { id: "phantich", label: "Phân tích" },
  { id: "giaiphap", label: "Giải pháp" },
  { id: "quiz", label: "Tương tác" },
  { id: "ketluan", label: "Kết luận" }
];

const THEORY_ITEMS = [
  {
    id: "von-lon",
    index: "01",
    cardTitle: "Vốn lớn",
    cardSummary: "Dự án điện, khí, truyền tải đòi hỏi vốn đầu tư dài hạn và sức chịu rủi ro cao.",
    detailTitle: "Vốn lớn và chu kỳ đầu tư dài",
    detailText:
      "Các ngành điện, dầu khí và viễn thông lõi thường có chi phí cố định ban đầu rất cao, thời gian thu hồi vốn kéo dài và cần bảo lãnh tín dụng ở quy mô quốc gia.",
    example:
      "Ví dụ Việt Nam: Các dự án nhà máy điện và lưới truyền tải 500kV đòi hỏi nguồn lực tài chính lớn hơn năng lực của đa số doanh nghiệp tư nhân trong giai đoạn đầu phát triển.",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1400&q=80",
    alt: "Hạ tầng công nghiệp quy mô lớn tại Việt Nam"
  },
  {
    id: "ha-tang",
    index: "02",
    cardTitle: "Hạ tầng quốc gia",
    cardSummary:
      "Hạ tầng xương sống cần tính liên thông, chuẩn kỹ thuật đồng bộ và phục vụ toàn dân.",
    detailTitle: "Hạ tầng quốc gia cần tính liên thông",
    detailText:
      "Với ngành hạ tầng thiết yếu, lợi ích xã hội không chỉ nằm ở lợi nhuận doanh nghiệp mà còn ở tính phủ rộng, độ ổn định và khả năng phục vụ vùng khó khăn.",
    example:
      "Ví dụ Việt Nam: Chương trình điện khí hóa nông thôn và mở rộng băng rộng giúp thu hẹp khoảng cách tiếp cận dịch vụ cơ bản giữa đô thị và miền núi.",
    image:
      "https://images.unsplash.com/photo-1518183214770-9cffbec72538?auto=format&fit=crop&w=1400&q=80",
    alt: "Phát triển hạ tầng quốc gia tại khu vực địa phương"
  },
  {
    id: "dieu-tiet",
    index: "03",
    cardTitle: "Điều tiết kinh tế",
    cardSummary:
      "Trong thời kỳ biến động, Nhà nước cần công cụ bình ổn để giảm sốc chi phí sinh hoạt.",
    detailTitle: "Công cụ điều tiết trong thời kỳ biến động",
    detailText:
      "Khi thị trường hàng hóa toàn cầu biến động mạnh, khu vực doanh nghiệp nhà nước có thể được dùng như bộ giảm chấn để hạn chế tác động dây chuyền lên đời sống dân cư.",
    example:
      "Ví dụ Việt Nam: Điều hành giá điện, xăng dầu theo lộ trình giúp nhà điều hành cân bằng giữa kiểm soát lạm phát và ổn định sản xuất.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    alt: "Không gian hoạch định chính sách và điều tiết kinh tế"
  }
];

const GROUP_ITEMS = [
  {
    id: "evn",
    sector: "Năng lượng",
    name: "EVN",
    summary: "Giữ vai trò trụ cột trong truyền tải điện và điều phối cung ứng cho toàn hệ thống.",
    role:
      "Đảm nhận trọng tâm ở khâu truyền tải, điều độ và bảo đảm cung ứng điện ổn định cho sản xuất và đời sống.",
    monopoly:
      "Lưới truyền tải có tính độc quyền tự nhiên cao vì chi phí đầu tư lớn, khó nhân bản hạ tầng song song và đòi hỏi điều phối tập trung.",
    example:
      "Ví dụ: Vai trò của EVN trong cân bằng phụ tải toàn quốc và triển khai truyền tải liên vùng để hạn chế nguy cơ thiếu điện cục bộ.",
    image:
      "https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=1300&q=80",
    alt: "Lưới điện cao thế và trạm biến áp"
  },
  {
    id: "pvn",
    sector: "Dầu khí",
    name: "PVN",
    summary:
      "Kết nối từ thượng nguồn khai thác đến hạ nguồn chế biến, bảo đảm an ninh năng lượng.",
    role:
      "Liên kết hoạt động thăm dò, khai thác, vận chuyển khí và chế biến dầu khí, đóng góp lớn cho an ninh năng lượng và ngân sách.",
    monopoly:
      "Thăm dò khai thác ngoài khơi cần năng lực công nghệ, vốn và quản trị rủi ro cao; yếu tố chủ quyền tài nguyên cũng làm tăng vai trò nhà nước.",
    example:
      "Ví dụ: Chuỗi dự án khí - điện - đạm cho thấy tính liên ngành và tác động lan tỏa của một hệ sinh thái dầu khí tích hợp.",
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1300&q=80",
    alt: "Giàn khoan ngoài khơi và công nghiệp lọc hóa dầu"
  },
  {
    id: "vnpt",
    sector: "Viễn thông",
    name: "VNPT/Viettel",
    summary: "Hạ tầng số diện rộng giúp mở dịch vụ công và kết nối vùng sâu, vùng xa.",
    role:
      "Phát triển mạng viễn thông diện rộng, cung cấp hạ tầng kết nối cho dịch vụ công trực tuyến và chuyển đổi số.",
    monopoly:
      "Một số lớp hạ tầng lõi có hiệu ứng mạng mạnh; nếu thiếu điều tiết, chênh lệch vùng miền và độc quyền dữ liệu có thể gia tăng.",
    example:
      "Ví dụ: Mở rộng phủ sóng và cáp quang tới vùng sâu hỗ trợ giáo dục, y tế từ xa và chính quyền số ở cấp địa phương.",
    image:
      "https://images.unsplash.com/photo-1581090700227-1e8e8d2f5d7c?auto=format&fit=crop&w=1300&q=80",
    alt: "Hạ tầng viễn thông, cáp quang và mạng số"
  }
];

const SOLUTION_ITEMS = [
  {
    id: "co-phan-hoa",
    title: "Cổ phần hóa có chọn lọc",
    explanation:
      "Thu hút thêm vốn xã hội ở các khâu có thể cạnh tranh, trong khi Nhà nước vẫn giữ tỷ lệ phù hợp ở mắt xích chiến lược.",
    benefit: "Lợi ích kỳ vọng: tăng kỷ luật tài chính và minh bạch quản trị.",
    implication:
      "Hàm ý chính sách: xác định rõ danh mục lĩnh vực Nhà nước cần chi phối tuyệt đối và lĩnh vực có thể mở rộng sở hữu hỗn hợp."
  },
  {
    id: "tach-quan-ly",
    title: "Tách chức năng quản lý và chủ sở hữu",
    explanation:
      "Cơ quan ban hành chính sách, cơ quan giám sát cạnh tranh và cơ quan đại diện vốn cần tách biệt để giảm xung đột lợi ích.",
    benefit: "Lợi ích kỳ vọng: nâng chất lượng điều tiết và trách nhiệm giải trình.",
    implication:
      "Hàm ý chính sách: chuẩn hóa cơ chế công bố thông tin, KPI hiệu quả và kiểm soát độc lập."
  },
  {
    id: "thi-truong-hoa",
    title: "Thị trường hóa có kiểm soát",
    explanation:
      "Mở cạnh tranh ở khâu phát điện, bán lẻ, dịch vụ số hoặc logistics liên quan; giữ điều tiết chặt ở hạ tầng độc quyền tự nhiên.",
    benefit: "Lợi ích kỳ vọng: giảm chi phí dài hạn, tăng đổi mới công nghệ.",
    implication:
      "Hàm ý chính sách: xây dựng lộ trình giá theo thị trường đi kèm cơ chế hỗ trợ nhóm dễ tổn thương."
  }
];

const SCENARIOS = [
  {
    id: "scenario-1",
    title: "Tình huống 1: Bình ổn giá điện trong giai đoạn lạm phát",
    description:
      "Chi phí nhiên liệu tăng nhanh, nhưng thu nhập hộ gia đình phục hồi chậm. Chính sách ưu tiên nào phù hợp hơn?",
    options: [
      {
        key: "a",
        label: "A. Giữ giá thấp đồng loạt cho mọi nhóm khách hàng",
        result: "mixed"
      },
      {
        key: "b",
        label: "B. Điều chỉnh có lộ trình, hỗ trợ trực tiếp nhóm dễ tổn thương",
        result: "good"
      }
    ]
  },
  {
    id: "scenario-2",
    title: "Tình huống 2: Mở cạnh tranh trong ngành điện",
    description:
      "Nhu cầu điện tăng mạnh theo công nghiệp hóa. Có nên mở rộng khu vực tư nhân ở khâu phát điện không?",
    options: [
      {
        key: "a",
        label: "A. Có, nhưng giữ điều độ và truyền tải dưới kiểm soát nhà nước",
        result: "good"
      },
      {
        key: "b",
        label: "B. Không, tiếp tục mô hình tích hợp tập trung như hiện tại",
        result: "mixed"
      }
    ]
  },
  {
    id: "scenario-3",
    title: "Tình huống 3: Mức độ sở hữu nhà nước trong doanh nghiệp hạ tầng",
    description:
      "Trong giai đoạn chuyển đổi số sâu, cấu trúc sở hữu nào cân bằng giữa kiểm soát chiến lược và hiệu quả quản trị?",
    options: [
      {
        key: "a",
        label: "A. Giữ 100% vốn nhà nước ở hầu hết các khâu",
        result: "mixed"
      },
      {
        key: "b",
        label: "B. Nhà nước giữ chi phối ở lõi độc quyền, mở sở hữu hỗn hợp ở khâu cạnh tranh",
        result: "good"
      }
    ]
  }
];

const QUIZ_FEEDBACK = {
  good:
    "Lựa chọn này theo hướng cân bằng: cho phép tín hiệu thị trường hoạt động nhưng vẫn bảo vệ nhóm dễ tổn thương và ổn định vĩ mô.",
  mixed:
    "Lựa chọn này có thể đạt mục tiêu ngắn hạn, nhưng rủi ro dài hạn là méo mó tín hiệu giá hoặc làm giảm động lực nâng cao hiệu quả."
};

function App() {
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
  }, []);

  useEffect(() => {
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
      { threshold: 0.14 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
          <div className="hero-inner" data-reveal="">
            <p className="kicker">Chuyên đề thảo luận học thuật</p>
            <h1>
              Tập đoàn kinh tế nhà nước tại Việt Nam: Độc quyền tự nhiên hay công cụ điều tiết
              vĩ mô?
            </h1>
            <p>
              Khi nền kinh tế cần ổn định, ai sẽ giữ những mắt xích quan trọng nhất trong năng
              lượng, dầu khí và hạ tầng số?
            </p>
            <div className="hero-actions">
              <a href="#lyluan" className="btn-primary">
                Bắt đầu trải nghiệm
              </a>
              <a href="#quiz" className="btn-ghost">
                Đi nhanh đến phần tranh luận
              </a>
            </div>
          </div>
        </section>

        <section id="lyluan">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Nền tảng lý thuyết</p>
              <h2 className="section-title">Vì sao mô hình tập đoàn nhà nước từng là lựa chọn chiến lược?</h2>
              <p className="section-sub">
                Nhấn vào từng luận điểm để xem diễn giải ngắn gọn và ví dụ cụ thể tại Việt Nam.
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
                Nhấn vào từng thẻ để mở phân tích vai trò kinh tế, tính độc quyền tự nhiên và ví dụ
                thực tiễn.
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
                    <p>{item.summary}</p>
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
              <h2 className="section-title">Công cụ điều tiết vĩ mô hay nguy cơ độc quyền kéo dài?</h2>
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
                      <span>
                        Tạo năng lực triển khai nhanh các dự án hạ tầng chiến lược quy mô lớn.
                      </span>
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
                      <span className="dot minus">-</span>
                      <span>Động lực cải tiến có thể suy giảm khi cạnh tranh bị giới hạn.</span>
                    </li>
                    <li>
                      <span className="dot minus">-</span>
                      <span>Chi phí quản trị cao dễ chuyển hóa thành gánh nặng giá và ngân sách.</span>
                    </li>
                    <li>
                      <span className="dot minus">-</span>
                      <span>Quy trình ra quyết định chậm, kém linh hoạt trước công nghệ mới.</span>
                    </li>
                    <li>
                      <span className="dot minus">-</span>
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
              <h2 className="section-title">Ba hướng thiết kế thể chế để dung hòa ổn định và cạnh tranh</h2>
              <p className="section-sub">Mở từng mục để xem lợi ích kỳ vọng và hàm ý chính sách.</p>
            </div>

            <div className="solution-layout">
              <figure className="solution-image" data-reveal="">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80"
                  alt="Bối cảnh hoạch định chính sách và cải cách thể chế kinh tế"
                />
                <figcaption className="solution-note">
                  Cải cách hiệu quả không chỉ là bán vốn, mà là thiết kế lại cơ chế giám sát, động
                  lực và trách nhiệm giải trình.
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

        <section id="quiz">
          <div className="container">
            <div className="section-head" data-reveal="">
              <p className="section-tag">Phần tương tác lớp học</p>
              <h2 className="section-title">Bạn sẽ chọn chính sách nào?</h2>
              <p className="section-sub">
                Mỗi lựa chọn đều có đánh đổi. Bấm A hoặc B để xem phản hồi và thảo luận ngay trên
                lớp.
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
                      className={`scenario-result ${answer ? "show" : ""} ${
                        answer?.result === "good" ? "good" : ""
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

        <section className="conclusion" id="ketluan">
          <div className="container">
            <div className="conclusion-box" data-reveal="">
              <div className="conclusion-media">
                <img
                  src="https://images.unsplash.com/photo-1533561052604-c3beb6d4f1d2?auto=format&fit=crop&w=1400&q=80"
                  alt="Hình tượng tre Việt Nam, biểu trưng cho cân bằng giữa gốc rễ và độ linh hoạt"
                />
              </div>
              <div className="conclusion-text">
                <p className="section-tag">Kết luận</p>
                <h3>
                  Giống như cây tre: <span className="highlight">rễ phải chắc</span>, nhưng{" "}
                  <span className="highlight">cành phải linh hoạt</span>.
                </h3>
                <p>
                  Trong cấu trúc kinh tế hiện đại, Nhà nước nên giữ vai trò nền tảng ở các mắt xích
                  độc quyền tự nhiên, đồng thời mở không gian cạnh tranh ở các khâu có thể thị trường
                  hóa.
                </p>
                <p>
                  Không cực đoan theo một phía, trọng tâm là thiết kế thể chế đủ minh bạch để vừa ổn
                  định vĩ mô, vừa khuyến khích hiệu quả dài hạn.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        Bản trình bày tương tác cho thảo luận lớp học: Tập đoàn kinh tế nhà nước và bài toán điều
        tiết vĩ mô tại Việt Nam.
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
              <h4 className="modal-title">{`${modalGroup.name} - Trụ cột hạ tầng`}</h4>
            </div>
            <div className="modal-body">
              <div>
                <h5>Vai trò chính</h5>
                <p>{modalGroup.role}</p>
              </div>
              <div>
                <h5>Lý do thiên về kiểm soát nhà nước</h5>
                <p>{modalGroup.monopoly}</p>
              </div>
              <div>
                <h5>Ví dụ thực tiễn</h5>
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
