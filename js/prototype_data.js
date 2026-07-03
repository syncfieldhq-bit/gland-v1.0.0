/* ========================================================
 * G-LAND v1.0.0 - Prototype Data
 * 写真から再現したラウンド例 (Par 72 = 4+4+4+5+4+3+5+3+4 / 4+4+4+5+3+4+5+3+4)
 * ======================================================== */

var PROTOTYPE_HOLES = [
  // OUT (1〜9)
  { holeNumber: 1,  par: 4, yard: 352, hasT: false, strokes: 5, putts: 2 },
  { holeNumber: 2,  par: 4, yard: 352, hasT: false, strokes: 4, putts: 2 },
  { holeNumber: 3,  par: 4, yard: 263, hasT: true,  strokes: 5, putts: 2 },
  { holeNumber: 4,  par: 5, yard: 469, hasT: false, strokes: null, putts: null },
  { holeNumber: 5,  par: 4, yard: 358, hasT: true,  strokes: null, putts: null },
  { holeNumber: 6,  par: 3, yard: 154, hasT: false, strokes: null, putts: null },
  { holeNumber: 7,  par: 5, yard: 455, hasT: false, strokes: null, putts: null },
  { holeNumber: 8,  par: 3, yard: 158, hasT: true,  strokes: null, putts: null },
  { holeNumber: 9,  par: 4, yard: 414, hasT: false, strokes: null, putts: null },
  // IN (10〜18)
  { holeNumber: 10, par: 4, yard: 375, hasT: false, strokes: null, putts: null },
  { holeNumber: 11, par: 4, yard: 390, hasT: false, strokes: null, putts: null },
  { holeNumber: 12, par: 4, yard: 289, hasT: true,  strokes: null, putts: null },
  { holeNumber: 13, par: 5, yard: 502, hasT: false, strokes: null, putts: null },
  { holeNumber: 14, par: 3, yard: 175, hasT: false, strokes: null, putts: null },
  { holeNumber: 15, par: 4, yard: 388, hasT: false, strokes: null, putts: null },
  { holeNumber: 16, par: 5, yard: 493, hasT: true,  strokes: null, putts: null },
  { holeNumber: 17, par: 3, yard: 180, hasT: true,  strokes: null, putts: null },
  { holeNumber: 18, par: 4, yard: 370, hasT: false, strokes: null, putts: null }
];

if (typeof window !== "undefined") {
  window.PROTOTYPE_HOLES = PROTOTYPE_HOLES;
}
