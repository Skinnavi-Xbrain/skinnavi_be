# Tương Tác Giữa Các Hoạt Chất (Ingredient Interactions)

Tài liệu này tổng hợp các quy tắc kết hợp hoạt chất (Actives) trong skincare. AI SkinNavi sử dụng để cảnh báo người dùng khi họ xây dựng Routine có các thành phần xung đột nhau.

## 1. Không Nên Kết Hợp Cùng Lúc (DO NOT MIX)

Sự kết hợp này có thể gây kích ứng nặng, bỏng rát, làm hỏng hàng rào bảo vệ da hoặc làm mất tác dụng của nhau.

### 1.1 Retinol + AHA/BHA (Tẩy da chết hóa học)
- **Lý do**: Cả hai đều thúc đẩy quá trình sừng hóa (turnover) tế bào. Dùng chung một lúc sẽ làm da quá tải, gây đỏ tấy, bong tróc và viêm da.
- **Giải pháp**: 
  - Dùng khác buổi: AHA/BHA buổi sáng, Retinol buổi tối (chỉ áp dụng nếu da rất khỏe và dung nạp tốt).
  - Dùng xen kẽ ngày (Khuyến nghị): Thứ 2-4-6 dùng Retinol, Thứ 3-5-7 dùng AHA/BHA.

### 1.2 Retinol + Benzoyl Peroxide (BP)
- **Lý do**: BP là chất oxy hóa mạnh, có thể làm phân hủy cấu trúc của phân tử Retinoids (ngoại trừ Adapalene có độ bền cao hơn). Dùng chung sẽ làm mất tác dụng của Retinol và gây khô da kinh khủng.
- **Giải pháp**: Dùng BP buổi sáng, Retinol buổi tối.

### 1.3 Vitamin C (L-Ascorbic Acid) + AHA/BHA
- **Lý do**: L-AA cần môi trường pH thấp (~3.5) để hoạt động. AHA/BHA cũng là acid. Dùng chung có thể làm pH da giảm quá sâu, gây châm chích và đỏ da.
- **Giải pháp**: Dùng Vitamin C buổi sáng (tăng cường chống nắng), AHA/BHA buổi tối. Nếu nhất thiết phải dùng chung, bôi Vitamin C, đợi 20 phút rồi mới bôi AHA/BHA (chỉ cho da cực khỏe).

### 1.4 Vitamin C (L-AA) + Niacinamide (Nồng độ cao >5%)
- **Lý do**: Trong môi trường acid (của Vitamin C), Niacinamide có thể bị thủy phân một phần nhỏ thành Niacin (Nicotinic acid), gây ra hiện tượng đỏ bừng mặt (flushing).
- **Giải pháp**: Không sao nếu Niacinamide nồng độ thấp hoặc dùng phái sinh Vitamin C (SAP, MAP). Nếu dùng L-AA và Niacinamide nồng độ cao, nên dùng khác buổi (Vit C sáng, Niacinamide tối) hoặc đợi 15-20 phút giữa 2 bước.

### 1.5 Nhiều sản phẩm tẩy tế bào chết (Scrubs + AHA/BHA)
- **Lý do**: Tẩy da chết vật lý (hạt scrub, máy rửa mặt cường độ mạnh) kết hợp với tẩy da chết hóa học (acid) sẽ bào mòn da, gây ra các vết xước vi thể (micro-tears) và hỏng màng bảo vệ.

## 2. Kết Hợp Hoàn Hảo (BEST PAIRINGS)

Những sự kết hợp này mang lại hiệu quả cộng hưởng (synergy) tốt cho da.

### 2.1 Vitamin C + Kem Chống Nắng
- **Hiệu quả**: Vitamin C là chất chống oxy hóa, giúp trung hòa các gốc tự do sinh ra từ tia UV mà kem chống nắng không cản được hết. Đây là bộ đôi bắt buộc cho buổi sáng để chống lão hóa.

### 2.2 Retinol + Niacinamide
- **Hiệu quả**: Retinol thường gây khô rát và suy yếu hàng rào da trong thời gian đầu. Niacinamide kích thích sản sinh Ceramide, củng cố hàng rào bảo vệ, giúp làm dịu và giảm tác dụng phụ của Retinol. 
- **Cách dùng**: Bôi Niacinamide trước, đợi ráo rồi bôi Retinol (hoặc ngược lại đều được tùy texture).

### 2.3 Retinol + Hyaluronic Acid / Ceramide / Peptide
- **Hiệu quả**: Bộ ba cấp ẩm và phục hồi (HA, Ceramide, Peptide) là "bảo hiểm" tuyệt vời khi dùng Retinol. Giúp hạn chế tối đa bong tróc và duy trì độ ẩm.

### 2.4 BHA + Niacinamide
- **Hiệu quả**: Bộ đôi đỉnh cao cho da dầu mụn, lỗ chân lông to. BHA làm sạch sâu lỗ chân lông, sau đó Niacinamide đi vào kiểm soát bã nhờn, kháng viêm và se khít lỗ chân lông.
- **Cách dùng**: Bôi BHA, đợi 15-20 phút rồi bôi Niacinamide.

## 3. Hướng Dẫn Tư Vấn Cho SkinNavi AI

Khi kiểm tra routine của người dùng, AI hãy thực hiện:
- **Quét xung đột**: Nếu thấy `Retinol` và `AHA/BHA` trong cùng một buổi (AM/PM), lập tức đưa ra Warning ❌.
- **Khuyên dùng thêm ẩm**: Nếu user dùng các chất mạnh (BP, Retinol, Acid), hãy check xem routine có đủ HA, Ceramide, Panthenol (B5) chưa. Nếu chưa, hãy gợi ý bổ sung kem dưỡng phục hồi.
- **Bắt buộc chống nắng**: Bất kể dùng active nào, AI phải kiểm tra và nhắc nhở bôi kem chống nắng phổ rộng (Broad-spectrum) SPF từ 30 trở lên vào ban ngày.
