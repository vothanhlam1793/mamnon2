---
name: "mcp-remote-debug"
description: "Guides remote web debugging (Safari/Chrome DevTools) and repeatable repro steps. Invoke when debugging mobile WebView issues (Zalo/Facebook/iOS) or network/video rendering."
---

# MCP Remote Debug (Loại 2) – Trae Desktop

## Mục tiêu
- Debug UI/DOM/CSS/JS giống như “đang cầm máy” khi lỗi chỉ xảy ra trên mobile WebView (Zalo/Facebook/iOS).
- Xem Console / Network / DOM / Computed styles để khoanh vùng lỗi nhanh (video sizing, orientation, touch events, PWA prompt...).

## iOS (Safari Web Inspector)
### Chuẩn bị
- Mac có Safari.
- iPhone/iPad bật:
  - Settings → Safari → Advanced → Web Inspector = ON
- Cắm cáp USB (ổn định nhất) hoặc cùng Wi‑Fi (tuỳ máy).

### Debug trang web mở trong Safari
- Mở trang trong Safari trên iPhone.
- Trên Mac Safari: Develop → [Tên iPhone] → chọn tab đang mở.
- Dùng:
  - Elements: xem DOM/CSS, box model, z-index
  - Console: log lỗi runtime
  - Network: xem request m3u8/ts, cache, status code, timing

### Debug trang mở trong WebView (Zalo/Facebook/Messenger)
Lưu ý: nhiều WebView không expose đầy đủ cho Safari Develop. Khi không thấy tab:
- Ưu tiên hướng dẫn người dùng “Mở bằng Safari”.
- Nếu bắt buộc debug trong WebView: kiểm tra bản iOS + app có cho remote inspection hay không (tuỳ phiên bản).

## Android (Chrome DevTools Remote)
### Chuẩn bị
- Android bật Developer options + USB debugging.
- Cắm USB.

### Debug
- Trên Chrome desktop: mở `chrome://inspect/#devices`
- Chọn thiết bị → Inspect tab đang chạy.

## Checklist tái hiện lỗi (copy/paste)
- URL:
- Thiết bị + OS:
- App: Safari / Zalo / Facebook / Chrome:
- Portrait/Landscape:
- Grid mode: 1/4/9:
- Bước thao tác:
- Kết quả mong đợi:
- Kết quả thực tế:
- Console errors (copy):
- Network (m3u8/ts) status:

## Khi nào invoke skill này?
- Khi lỗi chỉ xảy ra trên iOS/Zalo WebView.
- Khi cần xác định nguyên nhân do CSS layout/transform/object-fit.
- Khi cần kiểm tra HLS request (m3u8/ts) hoặc autoplay/playsinline behavior.
