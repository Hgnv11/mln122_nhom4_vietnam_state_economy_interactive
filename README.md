# Vietnam State Economy Interactive Simulation (MLN122 - Nhóm 4)

Dự án này là một ứng dụng web mô phỏng tương tác cao cấp, được thiết kế để giáo dục và trình bày về vai trò của các Tập đoàn kinh tế nhà nước trong nền kinh tế Việt Nam. Ứng dụng kết hợp giữa nội dung lý luận chính trị - kinh tế và một trò chơi mô phỏng quản lý vĩ mô thực tế.

## 🌟 Tính năng chính

- **Trò chơi Mô phỏng Vĩ mô (Policy-Sim)**: Trải nghiệm vai trò người điều phối kinh tế trong vòng 12 quý. Đưa ra các quyết định quan trọng cho các tập đoàn như EVN, PVN, VNPT để cân bằng các chỉ số quốc gia.
- **Hệ thống Chỉ số Thời gian thực**: Theo dõi biến động của:
  - **CPI (Lạm phát)**: Ngưỡng báo động 8.0%.
  - **An sinh xã hội**: Đảm bảo độ phủ dịch vụ công trên 70%.
  - **ROIC (Hiệu quả vốn)**: Duy trì sức khỏe tài chính của doanh nghiệp nhà nước.
  - **Ngân khố Quốc gia**: Quản lý dòng tiền và các gói cứu trợ.
- **Sự kiện Thiên nga đen (Black Swan)**: Các biến cố ngẫu nhiên như thiên tai, đột phá công nghệ hoặc biến động địa chính trị yêu cầu phản ứng tức thì.
- **Nội dung Giáo dục Đa phương thức**: Các phần Lý luận, Thực trạng, Phân tích và Giải pháp được trình bày sinh động với giao diện hiện đại.
- **Tranh luận Tương tác (Quiz)**: Các tình huống giả định để người dùng thực hành tư duy phản biện về chính sách.
- **Hệ thống Âm thanh & Hiệu ứng**: Tích hợp Web Audio API cho âm thanh phản hồi và nhạc nền ambient, cùng với Framer Motion cho các chuyển động mượt mà.

## 🛠️ Công nghệ sử dụng

- **Frontend Core**: [React.js](https://reactjs.org/) (Hooks, State Management)
- **Styling**: [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Custom Variables, Flexbox/Grid)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Audio**: [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (Procedural sound synthesis)

## 📁 Cấu trúc dự án

```text
mln/
├── src/
│   ├── App.jsx        # Toàn bộ logic ứng dụng, engine mô phỏng và UI components
│   ├── main.jsx       # Điểm khởi đầu ứng dụng
│   └── styles.css     # Hệ thống design system và styling
├── public/            # Tài nguyên tĩnh
├── index.html         # Template HTML chính
├── package.json       # Cấu hình dependencies và scripts
└── vite.config.js     # Cấu hình Vite
```

## ⚙️ Chi tiết Kỹ thuật: Logic & Luồng Xử lý Policy-Sim

Tài liệu này cung cấp cái nhìn sâu sắc về cách thức hoạt động của engine mô phỏng để hỗ trợ việc phát triển và mở rộng trong tương lai.

### 1. Quản lý Trạng thái (State Management)
Toàn bộ trò chơi được điều khiển bởi đối tượng `stats` cốt lõi:
- `cpi`: Chỉ số giá tiêu dùng (Lạm phát). Trạng thái nguy hiểm khi tăng cao.
- `cov`: Độ phủ an sinh xã hội. Trạng thái nguy hiểm khi giảm thấp.
- `roic`: Tỷ suất lợi nhuận trên vốn đầu tư. Đại diện cho sức khỏe doanh nghiệp.
- `bud`: Ngân khố quốc gia (tính bằng tỷ USD).

### 2. Vòng lặp Trò chơi (Game Loop)
Trò chơi diễn ra trong **12 Quý (Quarters)** với lộ trình:
- **Mỗi Quý thông thường**: Hệ thống rút một sự kiện từ `GAME_EVENTS`. Người chơi chọn phương án A hoặc B. Mỗi phương án có một `impact` (tác động) định sẵn vào 4 chỉ số trên.
- **Phiên họp Chính sách (Quý 4 & 8)**: Người chơi được chọn các "Nghị quyết vĩ mô" (`MACRO_POLICIES`). Các chính sách này tạo ra các **Buff/Debuff** vĩnh viễn (ví dụ: giảm đà tăng lạm phát mỗi quý hoặc tăng hiệu quả vốn khi có đối tác công tư).
- **Thiên nga đen (Random 20%)**: Xuất hiện ngẫu nhiên giữa các quý, mang lại các tác động cực đoan không thể né tránh, buộc người chơi phải có dự phòng ngân khố hoặc chỉ số an toàn.

### 3. Logic Tính toán & Ràng buộc
- **Xử lý Tác động**: `commitTurn` nhận các giá trị delta (thay đổi) và cộng dồn vào stats hiện tại. Nó cũng áp dụng các modifier từ `activePolicies`.
- **Điều kiện Kết thúc (Game Over)**: Các ngưỡng "tử vong" được kiểm tra sau mỗi lượt:
  - Lạm phát phi mã: `cpi >= 8.0%`
  - Đứt gãy an sinh: `cov <= 70%`
  - Khủng hoảng tài chính: `roic <= -5.0%`
  - Vỡ nợ quốc gia: `bud <= 0`
- **Hệ thống Đa kết thúc (Multiple Endings)**: Dựa trên sự kết hợp của các chỉ số vào Quý 12 để đánh giá phong cách điều hành (Kỹ trị, Dân túy, Tư bản, hoặc Bền bỉ).

### 4. Hệ thống Âm thanh & Tương tác (Audio Engine)
- Sử dụng **Web Audio API** thay vì file mp3 để tạo âm thanh procedural (tổng hợp trực tiếp từ sóng sin/vuông). 
- `SFX.bgm()` tạo nhạc nền ambient động, có khả năng tăng/giảm tần số và âm lượng dựa trên trạng thái game.

### 5. Cấu trúc Prompt Gợi ý để Nâng cấp (Prompting Strategy)
Để mở rộng module này, bạn nên cung cấp cho AI cấu trúc của đối tượng `GAME_EVENTS` và `stats`. 
*Ví dụ*: "Hãy tạo thêm 5 `GAME_EVENTS` mới liên quan đến lĩnh vực chuyển đổi số, mỗi event cần có 2 lựa chọn với `impact` cân bằng giữa ROIC và An sinh, tuân thủ định dạng JSON hiện có trong App.jsx."

---

## 🚀 Khởi chạy ứng dụng

Để chạy dự án ở môi trường phát triển:

1. Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/).
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Khởi chạy server phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập vào địa chỉ hiển thị trong terminal (thường là `http://localhost:5173`).

## ✍️ Tác giả

Dự án được thực hiện bởi **Nhóm 4 - Học phần Kinh tế Chính trị Mác-Lênin (MLN122)**.

- Mục tiêu: Hiện đại hóa phương thức truyền tải kiến thức lý luận thông qua tương tác số hóa.
- Định hướng: Tập trung vào vai trò chủ đạo của kinh tế nhà nước trong nền kinh tế thị trường định hướng XHCN tại Việt Nam.
