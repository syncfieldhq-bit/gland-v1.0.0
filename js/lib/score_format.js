/* ========================================================
 * G-LAND v1.0.0 - Score Format Library
 * 3 種の表示モード対応
 * ======================================================== */

const ScoreFormat = {
  /**
   * strokes を表示モードに応じて文字列化
   * @param {number|null} strokes
   * @param {number} par
   * @param {string} mode - "stroke" | "plusminus" | "symbol"
   * @returns {string}
   */
  format(strokes, par, mode = "stroke") {
    if (strokes == null || strokes === "" || strokes === 0) return "─";
    const s = Number(strokes);
    const p = Number(par);
    const diff = s - p;

    switch (mode) {
      case "stroke":
        return String(s);
      case "plusminus":
        if (diff === 0) return "E";
        return (diff > 0 ? "+" : "") + diff;
      case "symbol":
        return this.symbol(diff);
      default:
        return String(s);
    }
  },

  symbol(diff) {
    switch (diff) {
      case -3: return "⭐";       // アルバトロス
      case -2: return "◎";        // イーグル
      case -1: return "○";        // バーディ
      case 0:  return "─";        // パー
      case 1:  return "△";        // ボギー
      case 2:  return "□";        // ダブルボギー
      default:
        if (diff > 2) return "+" + diff;
        if (diff < -3) return diff.toString();
        return "─";
    }
  },

  /**
   * トータルのプラマイ表示 ("+2" / "E" / "-3")
   */
  totalDiff(strokes, par) {
    if (strokes == null || par == null || strokes === 0) return "";
    const diff = Number(strokes) - Number(par);
    if (diff === 0) return "E";
    return (diff > 0 ? "+" : "") + diff;
  }
};

// export for both browser and node
if (typeof window !== "undefined") window.ScoreFormat = ScoreFormat;
