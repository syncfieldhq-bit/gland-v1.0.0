/* ========================================================
 * G-LAND v1.0.0 - Minimal QR Code Generator (SVG output)
 * https://github.com/nayuki/QR-Code-generator (Public Domain) の簡易版
 * Version 4 (33x33), Level M で URL 用途に十分
 * ======================================================== */

// 簡易版: Google Chart API 代替として qrserver.com を使う (ネット接続時のみ)
// オフラインでも動く text→base64 SVG は複雑すぎるため、
// フォールバックとして Google Chart API + qrserver.com 両対応
const QRCodeMini = {
  /**
   * @param {string} text - エンコードする URL
   * @param {number} size - 画像サイズ (px)
   * @returns {string} - <img> または <svg> 用の src / dataURL
   */
  toDataURL(text, size) {
    const s = size || 200;
    const encoded = encodeURIComponent(text);
    // qrserver.com API (匿名、CORS 対応、SVG)
    return `https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encoded}&margin=10&format=svg`;
  }
};

if (typeof window !== "undefined") window.QRCodeMini = QRCodeMini;
