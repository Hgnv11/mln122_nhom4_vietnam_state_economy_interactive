# Nâng Cấp Policy-Sim Game

## Kiến trúc

1. `PolicySimGame` vẫn giữ cấu trúc cũ: 12 quý, CPI, An sinh, ROIC, Ngân sách, lựa chọn A/B, Thiên Nga Đen và quyền ban hành đạo luật ở quý 4/8.
2. `EventScene` là bộ dựng cảnh: tự nạp ảnh `.webp` từ `/assets/events/`, có nền dự phòng, và chọn hiệu ứng theo ngành.
3. `DecisionCard` thay nút A/B bằng thẻ quyết định có hover phóng to, viền phát sáng, minh họa động và preview tác động.
4. `ImpactPreview` hoạt ảnh hóa các chỉ số CPI, An sinh, ROIC và Ngân sách.
5. `EffectOverlay` tạo flash và particle burst khi người chơi ra quyết định.
6. `QuarterTimeline` hiển thị tiến trình 12 quý, đánh dấu quý 4/8 là mốc đạo luật.
7. `OutcomePanel` hiển thị báo cáo hậu quả sau mỗi quyết định hoặc biến cố.

## Nhóm cảnh

- `power`: lưới điện, EVN.
- `oil`: dầu khí, PVN.
- `coal`: than và nhiên liệu, TKV.
- `telecom`: viễn thông, VNPT.
- `finance/economic`: tài chính, NHNN.
- `aviation`: hàng không, VNA.
- `storm`: thiên tai.
- `shipping`: vận tải biển và đứt gãy logistics.
- `tech`: đột phá công nghệ.

## Prompt tạo ảnh đề xuất

Bão miền Trung:
`Bối cảnh game mô phỏng, bão lớn tại miền Trung Việt Nam, đường dây điện hư hại, nước ngập, ánh chớp, trung tâm điều hành khẩn cấp, điện ảnh, không chữ, tỉ lệ 16:9.`

Khủng hoảng hàng không:
`Bối cảnh game mô phỏng hàng không Việt Nam, đường băng đêm, máy bay nằm chờ, đèn cảnh báo, giao diện tài chính mờ, ánh xanh đỏ căng thẳng, không logo, không chữ, tỉ lệ 16:9.`

Dầu khí PVN:
`Giàn khoan ngoài khơi, biển động, đèn công nghiệp, khủng hoảng giá dầu Brent, cảm giác áp lực ngân sách, điện ảnh, không chữ, tỉ lệ 16:9.`

Lưới điện EVN:
`Trạm biến áp và lưới điện cao thế Việt Nam, tia điện, mây mùa khô, phòng điều độ năng lượng, điện ảnh, không chữ, tỉ lệ 16:9.`

Tài chính NHNN:
`Trung tâm tài chính Việt Nam, tòa nhà ngân hàng, biểu đồ đỏ lao dốc dạng hologram, không khí khủng hoảng tín dụng, không chữ, tỉ lệ 16:9.`

Viễn thông VNPT:
`Tháp viễn thông vùng núi Việt Nam, sóng 5G, cáp quang phát sáng, thung lũng chiều tối, cảm giác công nghệ và dịch vụ công, không chữ, tỉ lệ 16:9.`
